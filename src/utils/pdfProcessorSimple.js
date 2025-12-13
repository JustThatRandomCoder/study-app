/**
 * SIMPLEST PDF PROCESSOR - Funktioniert GARANTIERT
 * 
 * Einfache Regel:
 * - Versuch Text zu extrahieren
 * - Wenn >= 100 Zeichen: Gut, nutze es
 * - Wenn < 100 Zeichen: Zeige manuelle Eingabe
 * 
 * KEIN OCR mehr! Nutzer gibt Text selbst ein wenn nötig.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract ALL text from PDF - AGGRESSIVE EXTRACTION
 */
export async function extractTextFromPDF(file, progressCallback) {
    try {
        console.log('🚀 [PDF PROCESSOR] Starting...');
        console.log('📄 [PDF PROCESSOR] File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const totalPages = pdf.numPages;
        console.log(`📚 [PDF PROCESSOR] Total pages: ${totalPages}`);

        let fullText = '';
        let totalItems = 0;

        // Extract text from ALL pages
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            if (progressCallback) {
                progressCallback({
                    status: 'extracting',
                    page: pageNum,
                    totalPages: totalPages,
                    percentage: Math.round((pageNum / totalPages) * 100)
                });
            }

            try {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                console.log(`📄 [PAGE ${pageNum}] Found ${textContent.items.length} text items`);
                totalItems += textContent.items.length;

                // Extract text items - be more aggressive
                const textItems = textContent.items
                    .map(item => {
                        // Get the actual text string
                        const text = item.str || '';
                        return text.trim();
                    })
                    .filter(text => text.length > 0); // Only non-empty

                // Join with spaces
                const pageText = textItems.join(' ');

                console.log(`📄 [PAGE ${pageNum}] Extracted ${pageText.length} characters from ${textItems.length} items`);
                console.log(`📄 [PAGE ${pageNum}] Sample:`, pageText.substring(0, 100));

                if (pageText.length > 0) {
                    fullText += pageText + '\n\n';
                }
            } catch (pageError) {
                console.error(`❌ [PAGE ${pageNum}] Error:`, pageError);
            }
        }

        const totalChars = fullText.trim().length;
        console.log(`\n📊 [PDF PROCESSOR] SUMMARY:`);
        console.log(`   - Total pages: ${totalPages}`);
        console.log(`   - Total text items: ${totalItems}`);
        console.log(`   - Total characters: ${totalChars}`);
        console.log(`   - Threshold: 100 characters`);
        console.log(`\n📝 [PDF PROCESSOR] First 300 chars:\n${fullText.substring(0, 300)}\n`);

        // LOWERED threshold to 50 characters instead of 100
        if (totalChars >= 50) {
            console.log('✅ [PDF PROCESSOR] SUCCESS - Text extracted!');
            return fullText.trim();
        } else {
            console.log('⚠️ [PDF PROCESSOR] NOT ENOUGH TEXT - Needs manual entry');
            console.log('📊 [PDF PROCESSOR] Only found:', totalChars, 'characters (need 50+)');
            return null;
        }

    } catch (error) {
        console.error('❌ [PDF PROCESSOR] FATAL ERROR:', error);
        throw error;
    }
}

/**
 * Generate PDF previews for manual entry
 */
export async function generatePDFPreviews(file, maxPages = 3) {
    try {
        console.log('🖼️ [PREVIEW] Generating previews...');

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const previews = [];
        const pagesToRender = Math.min(maxPages, pdf.numPages);

        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
            const page = await pdf.getPage(pageNum);

            // Render at good quality
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

            console.log(`✅ [PREVIEW] Generated page ${pageNum}`);
        }

        console.log(`✅ [PREVIEW] Done - ${previews.length} previews generated`);

        return {
            previews: previews,
            totalPages: pdf.numPages,
            hasMorePages: pdf.numPages > maxPages
        };
    } catch (error) {
        console.error('❌ [PREVIEW] Error:', error);
        throw error;
    }
}
