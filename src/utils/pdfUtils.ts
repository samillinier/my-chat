import * as pdfjsLib from "pdfjs-dist"; import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api"; pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`; export async function extractTextFromPDF(file: File): Promise<string> { try { const arrayBuffer = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise; let fullText = ""; for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const textContent = await page.getTextContent(); const pageText = textContent.items.map((item: TextItem | TextMarkedContent) => "str" in item ? item.str : "").join(" "); fullText += pageText + "\n\n"; } return fullText.trim(); } catch (error) { console.error("Error extracting text from PDF:", error); throw new Error("Failed to extract text from PDF"); } }
