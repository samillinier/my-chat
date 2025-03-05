let pdfjsLib;
async function initPdfLib() {
    if (!pdfjsLib) {
        pdfjsLib = await import('pdfjs-dist/build/pdf.js');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    return pdfjsLib;
}
export async function extractTextFromPDF(file) {
    try {
        const pdfjs = await initPdfLib();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ') + '\n';
        }
        return text.trim();
    }
    catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}
