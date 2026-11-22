import fs from "fs";
import { PDFParse } from "pdf-parse";


/**
 * Extract text
 * @param {string} filePath - path to PDF file
 * @returns {Promise<{text:string,numPages:number}>}
*/

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return {
            text: data.text,
            numPages: data.numPages,
            info: data.info,
        };
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};