import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.eventNames.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY){
    console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables. ');
    process.exit(1);
}


/**
 * Generate flashcards from next
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @return {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Formate each flashcard as:
    Q: [clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]
    
    Seperate each flashcard with "---"
    
    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;

        const flashcards = [];
        const cards = generatedText.split('---').filter(c => c.trim());

        for(const card of cards) {
            const lines = card.trim().split('\n');
            let question = '',answer = '', difficulty = 'medium';

            for(const line of lines) {
                if(line.startsWith('Q:')){
                    question = line.substring(2).trim();
                }else if (line.startsWith('A:')){
                    answer = line.substring(2).trim();
                }else if(line.startsWith('D:')){
                    const diff = line.substring(2).trim().toLowerCase();
                    if(['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Gemini AP error:', error);
        throw new Error('Failed to generate flashcards');        
    }
};

/**
 * Generate quiz question
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @return {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}}
 */

export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    01: [Option 1]
    02: [Option 2]
    03: [Option 3]
    04: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: easy, medium, or hard]
    
    Separate question with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;

        const questions = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for(const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '',options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

            for(const line of lines) {
                const trimmed = line.trim();
                if(trimmed.startsWith('Q:')){
                    question = trimmed.substring(2).trim();
                }else if (trimmed.match(/^0\d:/)){
                    options.push(trimmed.substring(3).trim());
                }else if(trimmed.startsWith('C:')){
                    correctAnswer = trimmed.substring(2).trim();
                }else if(trimmed.startsWith('E:')){
                    explanation = trimmed.substring(2).trim();
                }else if(trimmed.startsWith('D:')){
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if(['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                questions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }

        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error('Gemini AP error:', error);
        throw new Error('Failed to generate quiz');        
    }
};


/**
 * Generate document summary
 * @param {string} text - Document text
 * @return {Promise<string>}
 */
export const generateSummary = async (text) => {
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas and important points.
    
    Text:
    
    ${text.substring(0, 20000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate summary');
    }    
};


/**
 * Chat with document context
 * @param {string} question - user question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @return {Promise<string>}
 */

export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[chunks ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `Based on the foloowing content from a document, Analyse the content and answer the user's question.
    If the answer is not in the context, say so.
    
    Contect:
    ${context}
    
    Question: ${question}
    
    Answer:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText;
    } catch (error) {
        console.error("Gemii API error:",error);
        throw new Error('Failed to process chat request');
    }  
};

/** Explain a specific concept
 * @param {string} concept -Concept to explain
 * @param {string} context - Relevant context
 * @return {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of "${concept}" baed on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Includes examples if relevant.
    
    Context:
    ${context.substring(0, 10000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText;
    } catch (error) {
        console.error("Gemii API error:",error);
        throw new Error('Failed to explain concept');
    }
    
}