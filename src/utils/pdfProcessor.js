import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from scanned/handwritten PDF using OCR
 * @param {File} file - The PDF file to extract text from
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<string>} - The extracted text content
 */
async function extractTextFromScannedPDF(file, progressCallback) {
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

            // Render page to canvas
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Convert canvas to image and perform OCR
            const imageData = canvas.toDataURL('image/png');

            const { data: { text } } = await Tesseract.recognize(
                imageData,
                'eng',
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
                    }
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
 * @returns {Promise<string>} - The extracted text content
 */
export async function extractTextFromPDF(file, progressCallback) {
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
            return await extractTextFromScannedPDF(file, progressCallback);
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
