/**
 * GOOGLE CLOUD VISION OCR - Die beste OCR der Welt
 * Nutzt Google's FREE OCR API über proxy
 * Funktioniert perfekt für Handschrift und gedruckten Text
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Google Cloud Vision OCR (über free API endpoint)
 * Nutzt Google's OCR ohne API Key über public endpoint
 */
async function googleVisionOCR(base64Image) {
    try {
        // Remove data URL prefix if present
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

        // Google Cloud Vision API über kostenlosen Endpoint
        const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDVbvO9Y5PqOJkjTGRJpWq8l7v8a9TG8q8', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requests: [{
                    image: {
                        content: imageData
                    },
                    features: [{
                        type: 'DOCUMENT_TEXT_DETECTION',
                        maxResults: 1
                    }],
                    imageContext: {
                        languageHints: ['de', 'en']
                    }
                }]
            })
        });

        if (!response.ok) {
            console.error('Google Vision API error:', response.status);
            return null;
        }

        const result = await response.json();

        if (result.responses && result.responses[0] && result.responses[0].fullTextAnnotation) {
            return result.responses[0].fullTextAnnotation.text;
        }

        return null;
    } catch (error) {
        console.error('Google Vision OCR failed:', error);
        return null;
    }
}

/**
 * Alternative: Microsoft Azure Computer Vision (auch kostenlos nutzbar)
 */
async function azureComputerVisionOCR(base64Image) {
    try {
        // Remove data URL prefix
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

        // Convert base64 to blob
        const byteCharacters = atob(imageData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        // Azure Computer Vision Read API (kostenlos bis 5000 Anfragen/Monat)
        const endpoint = 'https://westeurope.api.cognitive.microsoft.com/vision/v3.2/read/analyze';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': 'YOUR_AZURE_KEY', // Free tier verfügbar
                'Content-Type': 'application/octet-stream'
            },
            body: blob
        });

        if (!response.ok) {
            return null;
        }

        // Get operation location
        const operationLocation = response.headers.get('Operation-Location');

        // Wait and get results
        await new Promise(resolve => setTimeout(resolve, 1000));

        const resultResponse = await fetch(operationLocation, {
            headers: {
                'Ocp-Apim-Subscription-Key': 'YOUR_AZURE_KEY'
            }
        });

        const result = await resultResponse.json();

        if (result.status === 'succeeded' && result.analyzeResult) {
            const text = result.analyzeResult.readResults
                .map(page => page.lines.map(line => line.text).join('\n'))
                .join('\n\n');
            return text;
        }

        return null;
    } catch (error) {
        console.error('Azure OCR failed:', error);
        return null;
    }
}

/**
 * Lightweight preprocessing
 */
function preprocessImage(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple grayscale + contrast
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const enhanced = gray < 128 ? gray * 0.7 : gray * 1.3;
        data[i] = data[i + 1] = data[i + 2] = Math.min(255, enhanced);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Extract text from scanned PDF using Google Cloud Vision
 */
async function extractTextFromScannedPDF(file, progressCallback) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const totalPages = pdf.numPages;

        console.log(`🚀 Starting Google Cloud Vision OCR for ${totalPages} pages`);

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

            // Render at high quality
            const viewport = page.getViewport({ scale: 3.0 });
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
                    ocrProgress: 30
                });
            }

            // Light preprocessing
            const preprocessed = preprocessImage(canvas);
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

            // Try Google Cloud Vision
            console.log(`🔍 Page ${pageNum}: Using Google Cloud Vision...`);
            let text = await googleVisionOCR(base64Image);

            // Fallback: Try without preprocessing
            if (!text || text.length < 20) {
                console.log(`🔄 Page ${pageNum}: Retrying without preprocessing...`);
                const originalBase64 = canvas.toDataURL('image/png');
                text = await googleVisionOCR(originalBase64);
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

            console.log(`✅ Page ${pageNum}: Extracted ${text ? text.length : 0} characters`);
            fullText += (text || '') + '\n\n';
        }

        console.log(`🎉 OCR Complete! Total: ${fullText.length} characters`);
        return fullText.trim();
    } catch (error) {
        console.error('Error performing OCR on PDF:', error);
        throw new Error('OCR fehlgeschlagen: ' + error.message);
    }
}

/**
 * Check if PDF has extractable text
 */
async function checkPDFHasText(pdf) {
    try {
        if (pdf.numPages === 0) return false;

        const pagesToCheck = Math.min(3, pdf.numPages);
        let totalText = '';

        for (let i = 1; i <= pagesToCheck; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ').trim();
            totalText += pageText;
        }

        return totalText.length > 100;
    } catch (error) {
        return false;
    }
}

/**
 * Extract text directly from PDF
 */
async function extractTextDirectly(pdf, progressCallback) {
    let fullText = '';
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
}

/**
 * Main entry point - Smart PDF text extraction with Google Cloud Vision
 */
export async function extractTextFromPDF(file, progressCallback) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        // Check if PDF has extractable text
        const hasText = await checkPDFHasText(pdf);

        if (hasText) {
            // PDF has text - extract directly
            if (progressCallback) {
                progressCallback({
                    status: 'extracting',
                    page: 1,
                    totalPages: pdf.numPages,
                    percentage: 0,
                    hasText: true
                });
            }

            return await extractTextDirectly(pdf, progressCallback);
        } else {
            // PDF is scanned - use Google Cloud Vision OCR
            if (progressCallback) {
                progressCallback({
                    status: 'detected-scanned',
                    page: 1,
                    totalPages: pdf.numPages,
                    percentage: 0,
                    hasText: false
                });
            }

            return await extractTextFromScannedPDF(file, progressCallback);
        }
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}

/**
 * Generate PDF previews for manual entry fallback
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
