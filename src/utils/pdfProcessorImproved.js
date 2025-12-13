/**
 * PREMIUM OCR Implementation - Unbegrenzt und Lokal
 * Nutzt Tesseract.js mit OPTIMALEN Settings für Handschrift
 * Keine API-Limits, keine Cloud-Abhängigkeit
 */

import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * ULTIMATE Tesseract OCR with best settings for handwriting
 * Uses multiple PSM modes and combines results
 */
async function performUltimateOCR(canvas, language = 'deu') {
    const langMap = {
        'eng': 'eng',
        'deu': 'deu',
        'fra': 'fra',
        'spa': 'spa',
        'ita': 'ita',
        'por': 'por',
        'nld': 'nld',
        'pol': 'pol',
        'rus': 'rus',
        'jpn': 'jpn',
        'chi_sim': 'chi_sim',
        'kor': 'kor'
    };

    const tesseractLang = langMap[language] || 'deu';

    try {
        // Try multiple PSM (Page Segmentation Modes) for best results
        const psmModes = [
            { psm: Tesseract.PSM.AUTO, name: 'AUTO' },
            { psm: Tesseract.PSM.SINGLE_BLOCK, name: 'SINGLE_BLOCK' },
            { psm: Tesseract.PSM.SINGLE_COLUMN, name: 'SINGLE_COLUMN' }
        ];

        let bestResult = '';
        let bestConfidence = 0;

        for (const mode of psmModes) {
            console.log(`🔍 Trying PSM Mode: ${mode.name}`);

            const { data } = await Tesseract.recognize(
                canvas,
                tesseractLang,
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    },
                    tessedit_pageseg_mode: mode.psm,
                    tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
                    // Handwriting optimization
                    tessedit_char_whitelist: '',
                    preserve_interword_spaces: '1',
                    tessedit_enable_dict_correction: '1',
                    // Better accuracy
                    textord_heavy_nr: '1',
                    language_model_penalty_non_dict_word: '0.5',
                    language_model_penalty_non_freq_dict_word: '0.5'
                }
            );

            if (data.confidence > bestConfidence) {
                bestConfidence = data.confidence;
                bestResult = data.text;
            }

            // If we got good confidence, use it
            if (data.confidence > 70) {
                return data.text;
            }
        }

        console.log(`✅ Best OCR confidence: ${bestConfidence.toFixed(1)}%`);
        return bestResult;

    } catch (error) {
        console.error('Tesseract OCR failed:', error);
        throw error;
    }
}

/**
 * EXTREME image preprocessing - optimized for handwriting
 */
function preprocessForHandwriting(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Step 1: Grayscale conversion
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
    }

    // Step 2: Extreme contrast boost for handwriting
    const contrastFactor = 3.0; // VIEL höher für Handschrift
    const factor = (259 * (contrastFactor * 255 + 255)) / (255 * (259 - contrastFactor * 255));

    for (let i = 0; i < data.length; i += 4) {
        let value = data[i];
        value = factor * (value - 128) + 128;
        value = Math.max(0, Math.min(255, value));
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    // Step 3: Adaptive binarization (Otsu's method approximation)
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
        histogram[Math.floor(data[i])]++;
    }

    let sum = 0;
    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let max = 0;
    let threshold = 0;
    const total = canvas.width * canvas.height;

    for (let i = 0; i < 256; i++) {
        sum += i * histogram[i];
    }

    for (let i = 0; i < 256; i++) {
        wB += histogram[i];
        if (wB === 0) continue;

        wF = total - wB;
        if (wF === 0) break;

        sumB += i * histogram[i];
        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;
        const between = wB * wF * (mB - mF) * (mB - mF);

        if (between > max) {
            max = between;
            threshold = i;
        }
    }

    // Apply threshold - but keep slightly softer for handwriting
    threshold = Math.max(120, threshold - 20); // Handwriting needs lower threshold

    for (let i = 0; i < data.length; i += 4) {
        const value = data[i] > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    // Step 4: Noise reduction
    const kernel = 3;
    const half = Math.floor(kernel / 2);
    const tempData = new Uint8ClampedArray(data);

    for (let y = half; y < canvas.height - half; y++) {
        for (let x = half; x < canvas.width - half; x++) {
            let sum = 0;
            let count = 0;

            for (let ky = -half; ky <= half; ky++) {
                for (let kx = -half; kx <= half; kx++) {
                    const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
                    sum += tempData[idx];
                    count++;
                }
            }

            const idx = (y * canvas.width + x) * 4;
            const avg = sum / count;
            data[idx] = data[idx + 1] = data[idx + 2] = avg > 127 ? 255 : 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Extract text from scanned PDF with ULTIMATE OCR
 * No limits, fully local processing
 */
async function extractTextFromScannedPDF(file, progressCallback, language = 'eng') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const totalPages = pdf.numPages;

        console.log(`🚀 Starting ULTIMATE OCR for ${totalPages} pages`);

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

            // Render at MAXIMUM quality - 5x scale for handwriting
            const viewport = page.getViewport({ scale: 5.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            if (progressCallback) {
                progressCallback({
                    status: 'ocr',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100),
                    ocrProgress: 20
                });
            }

            // Try with preprocessing
            console.log(`📝 Page ${pageNum}: Preprocessing...`);
            const preprocessed = preprocessForHandwriting(canvas);

            if (progressCallback) {
                progressCallback({
                    status: 'ocr',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100),
                    ocrProgress: 40
                });
            }

            // Perform ULTIMATE OCR
            console.log(`🔍 Page ${pageNum}: Running multi-mode OCR...`);
            let text = await performUltimateOCR(preprocessed, language);

            // If result is poor, try without preprocessing
            if (!text || text.trim().length < 20) {
                console.log(`🔄 Page ${pageNum}: Retrying without preprocessing...`);

                // Re-render original
                const canvas2 = document.createElement('canvas');
                const context2 = canvas2.getContext('2d');
                canvas2.width = viewport.width;
                canvas2.height = viewport.height;

                await page.render({
                    canvasContext: context2,
                    viewport: viewport
                }).promise;

                text = await performUltimateOCR(canvas2, language);
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

            console.log(`✅ Page ${pageNum}: Extracted ${text.length} characters`);
            fullText += text + '\n\n';
        }

        console.log(`🎉 OCR Complete! Total: ${fullText.length} characters`);
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
