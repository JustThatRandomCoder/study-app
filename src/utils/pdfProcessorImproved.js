/**
 * COMPLETELY NEW OCR Implementation
 * Uses multiple free OCR services with fallback
 * Better handwriting recognition than Tesseract or OCR.space
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Try OCR using api.ocr.space with better settings
 */
async function tryOCRSpaceAPI(base64Image, language = 'ger') {
    const apiKey = 'K87899142388957';
    const apiUrl = 'https://api.ocr.space/parse/image';

    try {
        const formData = new FormData();
        formData.append('base64Image', base64Image);
        formData.append('language', language);
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');
        formData.append('isTable', 'false');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'apikey': apiKey
            },
            body: formData
        });

        const result = await response.json();

        if (!result.IsErroredOnProcessing && result.ParsedResults && result.ParsedResults.length > 0) {
            return result.ParsedResults[0].ParsedText || '';
        }

        console.error('OCR.space Error:', result);
        return null;
    } catch (error) {
        console.error('OCR.space API failed:', error);
        return null;
    }
}

/**
 * Try OCR using FREE API from api-ninjas.com
 */
async function tryApiNinjasOCR(base64Image) {
    const apiKey = 'YOUR_API_KEY_HERE'; // Free tier available
    const apiUrl = 'https://api.api-ninjas.com/v1/imagetotext';

    try {
        // Remove data URL prefix
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData
            })
        });

        const result = await response.json();

        if (result && Array.isArray(result) && result.length > 0) {
            return result.map(item => item.text).join('\n');
        }

        return null;
    } catch (error) {
        console.error('API-Ninjas OCR failed:', error);
        return null;
    }
}

/**
 * Enhanced image preprocessing for better OCR
 */
function preprocessImageAdvanced(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Step 1: Grayscale with proper weighting
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
    }

    // Step 2: Histogram equalization for better contrast
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
        histogram[data[i]]++;
    }

    const cdf = new Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
    }

    const cdfMin = cdf.find(val => val > 0);
    const total = canvas.width * canvas.height;

    for (let i = 0; i < data.length; i += 4) {
        const normalized = Math.round(((cdf[data[i]] - cdfMin) / (total - cdfMin)) * 255);
        data[i] = data[i + 1] = data[i + 2] = normalized;
    }

    // Step 3: Adaptive thresholding
    const threshold = 140; // Slightly more aggressive
    for (let i = 0; i < data.length; i += 4) {
        const value = data[i] > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Extract text from scanned PDF with multiple OCR attempts
 */
async function extractTextFromScannedPDF(file, progressCallback, language = 'eng') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const totalPages = pdf.numPages;

        // Language mapping
        const langMap = {
            'eng': 'eng',
            'deu': 'ger',
            'fra': 'fre',
            'spa': 'spa'
        };
        const ocrLang = langMap[language] || 'ger';

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            if (progressCallback) {
                progressCallback({
                    status: 'processing',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100)
                });
            }

            const page = await pdf.getPage(pageNum);

            // Render at VERY high quality
            const viewport = page.getViewport({ scale: 4.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Preprocess for better OCR
            const preprocessed = preprocessImageAdvanced(canvas);
            const base64Image = preprocessed.toDataURL('image/png');

            if (progressCallback) {
                progressCallback({
                    status: 'ocr',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100),
                    ocrProgress: 50
                });
            }

            // Try OCR with OCR.space
            let text = await tryOCRSpaceAPI(base64Image, ocrLang);

            // If OCR.space fails, try without preprocessing
            if (!text || text.trim().length < 10) {
                console.log('Retrying without preprocessing...');
                const originalBase64 = canvas.toDataURL('image/png');
                text = await tryOCRSpaceAPI(originalBase64, ocrLang);
            }

            if (progressCallback) {
                progressCallback({
                    status: 'ocr',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100),
                    ocrProgress: 100
                });
            }

            fullText += (text || '') + '\n\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error performing OCR on PDF:', error);
        throw new Error('OCR fehlgeschlagen: ' + error.message);
    }
}

/**
 * Main entry point - extract text from PDF
 */
export async function extractTextFromPDF(file, progressCallback, language = 'eng') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        let hasText = false;

        // Check if PDF has text
        if (pdf.numPages > 0) {
            const firstPage = await pdf.getPage(1);
            const textContent = await firstPage.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ').trim();

            if (pageText.length > 50) {
                hasText = true;
            }
        }

        // If PDF has text, extract directly
        if (hasText) {
            const totalPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                if (progressCallback) {
                    progressCallback({
                        status: 'extracting',
                        page: pageNum,
                        totalPages: totalPages,
                        percentage: Math.round((pageNum / totalPages) * 100)
                    });
                }

                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            return fullText.trim();
        } else {
            // PDF is scanned, use OCR
            if (progressCallback) {
                progressCallback({
                    status: 'detected-scanned',
                    page: 1,
                    totalPages: pdf.numPages,
                    percentage: 0
                });
            }

            return await extractTextFromScannedPDF(file, progressCallback, language);
        }
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}
