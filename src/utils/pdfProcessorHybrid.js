/**
 * HYBRID PDF Processor - Smart & User-Friendly
 * 1. Extracts text directly from PDF if available
 * 2. For scanned PDFs: Shows preview + manual text entry option
 * 3. Optional: Try OCR as helper, but user can edit/override
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Check if PDF has extractable text
 */
async function checkPDFHasText(pdf) {
    try {
        if (pdf.numPages === 0) return false;

        // Check first 3 pages for text
        const pagesToCheck = Math.min(3, pdf.numPages);
        let totalText = '';

        for (let i = 1; i <= pagesToCheck; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ').trim();
            totalText += pageText;
        }

        // If we found substantial text, it's not scanned
        return totalText.length > 100;
    } catch (error) {
        console.error('Error checking PDF text:', error);
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
 * Generate high-quality preview images of all PDF pages
 */
export async function generatePDFPreviews(file, maxPages = 5) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const previews = [];
        const pagesToRender = Math.min(maxPages, pdf.numPages);

        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
            const page = await pdf.getPage(pageNum);

            // Render at good quality for preview
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
 * Main entry point - Smart PDF text extraction
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
            // PDF is scanned - return signal for manual entry
            if (progressCallback) {
                progressCallback({
                    status: 'scanned-detected',
                    page: 1,
                    totalPages: pdf.numPages,
                    percentage: 0,
                    hasText: false,
                    needsManualEntry: true
                });
            }

            // Return empty - UI will show manual entry option
            return null;
        }
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}
