/**
 * ULTIMATE PDF Processor - Funktioniert GARANTIERT!
 * 
 * 3-Stufen-Strategie:
 * 1. Versuche direkten Text zu extrahieren (für normale PDFs)
 * 2. Wenn das fehlschlägt: OCR mit OPTIMALEN Settings
 * 3. Wenn OCR nicht gut: Zeige Preview + manuelle Eingabe
 */

import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Verbesserte Bildverarbeitung speziell für PDF-Text
 */
function enhanceImageForOCR(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 1. Grayscale conversion
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
    }

    // 2. Contrast enhancement (moderate)
    const contrast = 1.5;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        let value = data[i];
        value = factor * (value - 128) + 128;
        value = Math.max(0, Math.min(255, value));
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * OCR mit Tesseract - OPTIMALE Settings für PDF-Dokumente
 */
async function performOCR(canvas, language = 'deu+eng', onProgress = null) {
    try {
        console.log('🔍 Starting OCR with language:', language);

        const result = await Tesseract.recognize(
            canvas,
            language,
            {
                logger: (m) => {
                    if (m.status === 'recognizing text' && onProgress) {
                        onProgress(Math.round(m.progress * 100));
                    }
                },
                // Optimale Settings für Dokumente
                tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
            }
        );

        console.log(`✅ OCR completed. Confidence: ${result.data.confidence}%`);
        return {
            text: result.data.text,
            confidence: result.data.confidence
        };
    } catch (error) {
        console.error('❌ OCR error:', error);
        return { text: '', confidence: 0 };
    }
}

/**
 * Extrahiere Text direkt aus PDF (für normale PDFs mit Text)
 */
async function extractTextDirectly(pdf, progressCallback) {
    let fullText = '';
    const totalPages = pdf.numPages;

    console.log(`📄 Extracting text directly from ${totalPages} pages...`);

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
}

/**
 * OCR für gescannte PDFs
 */
async function extractTextWithOCR(pdf, progressCallback, language = 'deu+eng') {
    let fullText = '';
    const totalPages = pdf.numPages;
    const maxPagesToProcess = Math.min(5, totalPages); // Max 5 Seiten für OCR

    console.log(`🔍 Starting OCR for ${maxPagesToProcess} pages (of ${totalPages})...`);

    for (let pageNum = 1; pageNum <= maxPagesToProcess; pageNum++) {
        if (progressCallback) {
            progressCallback({
                status: 'ocr',
                page: pageNum,
                totalPages: maxPagesToProcess,
                percentage: Math.round((pageNum / maxPagesToProcess) * 100),
                ocrProgress: 0
            });
        }

        const page = await pdf.getPage(pageNum);

        // Render mit hoher Qualität
        const viewport = page.getViewport({ scale: 3.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Preprocessing
        const enhanced = enhanceImageForOCR(canvas);

        if (progressCallback) {
            progressCallback({
                status: 'ocr',
                page: pageNum,
                totalPages: maxPagesToProcess,
                percentage: Math.round((pageNum / maxPagesToProcess) * 100),
                ocrProgress: 30
            });
        }

        // Perform OCR
        const result = await performOCR(enhanced, language, (ocrProgress) => {
            if (progressCallback) {
                progressCallback({
                    status: 'ocr',
                    page: pageNum,
                    totalPages: maxPagesToProcess,
                    percentage: Math.round((pageNum / maxPagesToProcess) * 100),
                    ocrProgress: 30 + Math.round(ocrProgress * 0.7)
                });
            }
        });

        console.log(`📝 Page ${pageNum}: ${result.text.length} chars, ${result.confidence.toFixed(1)}% confidence`);
        fullText += result.text + '\n\n';
    }

    if (totalPages > maxPagesToProcess) {
        fullText += `\n\n[Hinweis: Nur ${maxPagesToProcess} von ${totalPages} Seiten wurden verarbeitet]\n`;
    }

    return fullText.trim();
}

/**
 * Check if PDF has extractable text
 */
async function checkPDFHasText(pdf) {
    try {
        if (pdf.numPages === 0) return false;

        // Check first 3 pages
        const pagesToCheck = Math.min(3, pdf.numPages);
        let totalText = '';

        for (let i = 1; i <= pagesToCheck; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ').trim();
            totalText += pageText;
        }

        const hasSignificantText = totalText.length > 100;
        console.log(`📊 PDF text check: ${totalText.length} chars found, hasText: ${hasSignificantText}`);

        return hasSignificantText;
    } catch (error) {
        console.error('Error checking PDF text:', error);
        return false;
    }
}

/**
 * Generate PDF previews
 */
export async function generatePDFPreviews(file, maxPages = 3) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const previews = [];
        const pagesToRender = Math.min(maxPages, pdf.numPages);

        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
            const page = await pdf.getPage(pageNum);

            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            previews.push({
                pageNum: pageNum,
                dataUrl: canvas.toDataURL('image/png'),
                width: viewport.width,
                height: viewport.height
            });
        }

        return {
            previews: previews,
            totalPages: pdf.numPages,
            hasMorePages: pdf.numPages > maxPages
        };
    } catch (error) {
        console.error('Error generating previews:', error);
        throw error;
    }
}

/**
 * MAIN FUNCTION - Intelligente PDF Text-Extraktion
 */
export async function extractTextFromPDF(file, progressCallback, language = 'deu+eng') {
    try {
        console.log('🚀 Starting PDF processing...');

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        console.log(`📄 PDF loaded: ${pdf.numPages} pages`);

        // STEP 1: Check if PDF has extractable text
        const hasText = await checkPDFHasText(pdf);

        if (hasText) {
            // Normal PDF with text - extract directly
            console.log('✅ PDF has text - extracting directly');

            if (progressCallback) {
                progressCallback({
                    status: 'extracting',
                    page: 1,
                    totalPages: pdf.numPages,
                    percentage: 0,
                    hasText: true
                });
            }

            const text = await extractTextDirectly(pdf, progressCallback);
            console.log(`✅ Extracted ${text.length} characters directly`);
            return text;
        } else {
            // STEP 2: Scanned PDF - use OCR
            console.log('⚠️ PDF appears to be scanned - attempting OCR');

            if (progressCallback) {
                progressCallback({
                    status: 'detected-scanned',
                    page: 1,
                    totalPages: pdf.numPages,
                    percentage: 0,
                    hasText: false
                });
            }

            const text = await extractTextWithOCR(pdf, progressCallback, language);

            if (text.length < 100) {
                console.log('❌ OCR result too short - returning null for manual entry');
                return null;
            }

            console.log(`✅ OCR extracted ${text.length} characters`);
            return text;
        }
    } catch (error) {
        console.error('❌ Error extracting text from PDF:', error);
        throw error;
    }
}
