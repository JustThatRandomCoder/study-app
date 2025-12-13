import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Advanced image preprocessing for handwriting recognition
 * Applies multiple techniques to enhance text clarity
 * @param {HTMLCanvasElement} canvas - Original canvas
 * @returns {HTMLCanvasElement} - Preprocessed canvas
 */
function preprocessImage(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Step 1: Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
    }

    // Step 2: Apply aggressive contrast enhancement
    const contrast = 2.0; // Increased from 1.5
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
        data[i + 1] = data[i];
        data[i + 2] = data[i];
    }

    // Step 3: Calculate Otsu's threshold for binarization
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
        histogram[data[i]]++;
    }

    const total = canvas.width * canvas.height;
    let sum = 0;
    for (let i = 0; i < 256; i++) {
        sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVar = 0;
    let threshold = 0;

    for (let t = 0; t < 256; t++) {
        wB += histogram[t];
        if (wB === 0) continue;

        wF = total - wB;
        if (wF === 0) break;

        sumB += t * histogram[t];
        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;
        const varBetween = wB * wF * (mB - mF) * (mB - mF);

        if (varBetween > maxVar) {
            maxVar = varBetween;
            threshold = t;
        }
    }

    // Step 4: Apply adaptive binarization with the calculated threshold
    // Make it slightly more aggressive to separate ink from background
    threshold = Math.max(threshold - 20, 100); // Lower threshold to catch more text

    for (let i = 0; i < data.length; i += 4) {
        const value = data[i] > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    // Step 5: Apply morphological operations (dilation) to thicken text
    const tempData = new Uint8ClampedArray(data);
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;

            // Check 3x3 neighborhood - if any pixel is black (text), make center black
            let hasText = false;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                    if (tempData[neighborIdx] === 0) {
                        hasText = true;
                        break;
                    }
                }
                if (hasText) break;
            }

            if (hasText && tempData[idx] === 255) {
                data[idx] = data[idx + 1] = data[idx + 2] = 0;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Extract text from scanned/handwritten PDF using OCR
 * @param {File} file - The PDF file to extract text from
 * @param {Function} progressCallback - Optional callback for progress updates
 * @param {string} language - OCR language code (e.g., 'eng', 'deu', 'fra')
 * @returns {Promise<string>} - The extracted text content
 */
async function extractTextFromScannedPDF(file, progressCallback, language = 'eng') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const totalPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            // Update progress
            if (progressCallback) {
                progressCallback({
                    status: 'processing',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100)
                });
            }

            const page = await pdf.getPage(pageNum);

            // Render page to canvas with maximum quality for better OCR
            const viewport = page.getViewport({ scale: 4.0 }); // Increased to 4.0 for maximum quality
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Apply aggressive image preprocessing for better handwriting recognition
            const preprocessedCanvas = preprocessImage(canvas);
            const imageData = preprocessedCanvas.toDataURL('image/png');

            const { data: { text } } = await Tesseract.recognize(
                imageData,
                language,
                {
                    logger: (m) => {
                        if (progressCallback && m.status === 'recognizing text') {
                            progressCallback({
                                status: 'ocr',
                                page: pageNum,
                                totalPages: totalPages,
                                percentage: Math.round((pageNum / totalPages) * 100),
                                ocrProgress: Math.round(m.progress * 100)
                            });
                        }
                    },
                    // Optimized Tesseract settings for handwriting
                    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                    tessedit_char_whitelist: '', // No restrictions - allow all characters
                    preserve_interword_spaces: '1',
                    tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Use LSTM neural network for better accuracy
                }
            );

            fullText += text + '\n\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error performing OCR on PDF:', error);
        throw new Error('Failed to extract text using OCR. The PDF might be corrupted or unreadable.');
    }
}

/**
 * Extract text content from a PDF file
 * Automatically detects if OCR is needed for scanned/handwritten PDFs
 * @param {File} file - The PDF file to extract text from
 * @param {Function} progressCallback - Optional callback for progress updates
 * @param {string} language - OCR language code (e.g., 'eng', 'deu', 'fra')
 * @returns {Promise<string>} - The extracted text content
 */
export async function extractTextFromPDF(file, progressCallback, language = 'eng') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        let hasText = false;

        // Try regular text extraction first
        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');

            if (pageText.trim().length > 50) {
                hasText = true;
                break;
            }
        }

        // If no text found, it's likely a scanned PDF - use OCR
        if (!hasText) {
            if (progressCallback) {
                progressCallback({
                    status: 'detected-scanned',
                    message: 'Scanned PDF detected. Using OCR to extract text...'
                });
            }
            return await extractTextFromScannedPDF(file, progressCallback, language);
        }

        // Extract text normally from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            if (progressCallback) {
                progressCallback({
                    status: 'extracting',
                    page: pageNum,
                    totalPages: pdf.numPages,
                    percentage: Math.round((pageNum / pdf.numPages) * 100)
                });
            }

            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
    }
}

/**
 * Clean and normalize text
 * @param {string} text - Raw text to clean
 * @returns {string} - Cleaned text
 */
export function cleanText(text) {
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[^\w\s.,;:!?-]/g, '') // Remove special characters except basic punctuation
        .trim();
}
