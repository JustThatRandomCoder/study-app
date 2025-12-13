/**
 * Alternative OCR implementation using OCR.space API
 * Much better accuracy than Tesseract for handwriting
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// OCR.space API configuration
const OCR_API_KEY = 'K87899142388957'; // Free tier API key
const OCR_API_URL = 'https://api.ocr.space/parse/image';

/**
 * Perform OCR using OCR.space API
 * @param {string} base64Image - Base64 encoded image
 * @param {string} language - Language code (eng, ger, fre, etc.)
 * @returns {Promise<string>} - Extracted text
 */
async function performOCRSpace(base64Image, language = 'eng') {
    // Map our language codes to OCR.space language codes
    const languageMap = {
        'eng': 'eng',
        'deu': 'ger',
        'fra': 'fre',
        'spa': 'spa',
        'ita': 'ita',
        'por': 'por',
        'nld': 'dut',
        'pol': 'pol',
        'rus': 'rus',
        'chi_sim': 'chs',
        'jpn': 'jpn',
        'kor': 'kor'
    };

    const ocrLang = languageMap[language] || 'eng';

    const formData = new FormData();
    formData.append('base64Image', base64Image);
    formData.append('language', ocrLang);
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Use OCR Engine 2 (better for handwriting)

    try {
        const response = await fetch(OCR_API_URL, {
            method: 'POST',
            headers: {
                'apikey': OCR_API_KEY
            },
            body: formData
        });

        const result = await response.json();

        if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage || 'OCR processing failed');
        }

        if (result.ParsedResults && result.ParsedResults.length > 0) {
            return result.ParsedResults[0].ParsedText || '';
        }

        return '';
    } catch (error) {
        console.error('OCR.space API error:', error);
        throw error;
    }
}

/**
 * Extract text from scanned/handwritten PDF using OCR.space API
 * @param {File} file - The PDF file
 * @param {Function} progressCallback - Progress callback
 * @param {string} language - OCR language code
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromScannedPDF(file, progressCallback, language = 'eng') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const totalPages = pdf.numPages;

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

            // Render page to canvas with high quality
            const viewport = page.getViewport({ scale: 3.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Convert canvas to base64
            const base64Image = canvas.toDataURL('image/png').split(',')[1];

            if (progressCallback) {
                progressCallback({
                    status: 'ocr',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100),
                    ocrProgress: 50
                });
            }

            // Perform OCR using OCR.space API
            const text = await performOCRSpace('data:image/png;base64,' + base64Image, language);

            if (progressCallback) {
                progressCallback({
                    status: 'ocr',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100),
                    ocrProgress: 100
                });
            }

            fullText += text + '\n\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error performing OCR on PDF:', error);
        throw new Error('Failed to extract text using OCR. ' + error.message);
    }
}

/**
 * Extract text content from a PDF file
 * Automatically detects if OCR is needed
 * @param {File} file - The PDF file
 * @param {Function} progressCallback - Progress callback
 * @param {string} language - OCR language code
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromPDF(file, progressCallback, language = 'eng') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        let hasText = false;

        // Check first page for text
        if (pdf.numPages > 0) {
            const firstPage = await pdf.getPage(1);
            const textContent = await firstPage.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ').trim();

            if (pageText.length > 50) {
                hasText = true;
            }
        }

        // If PDF has text, extract it directly (faster)
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
            // PDF is scanned/handwritten, use OCR.space API
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
