// /**
//  * Split text into chunks for better Ai processing
//  * @param {string} text - Full text to chunk
//  * @param {string} chunkSize - Target size per chunk ( in words )
//  * @param {string} overlap - Number of words to overlap between chunks
//  * @return {Array<{content:string,chunkIndex:number,pageNumber:number}>}
//  */

// export const chunkText = (text, chunkSize = 500, overlap = 50) => {
//     if (!text || text.trim().length === 0) {
//         return [];
//     }

//     const cleanedText = text
//     .replace(/\r\n/g,'\n')
//     .replace(/\s+/g,' ')
//     .replace(/\n /g,'\n')
//     .replace(/ \n/g,'\n')
//     .trim();


//     const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

//     const chunks = [];
//     let currentChunk = [];
//     let currentWordCount = 0;
//     let chunkIndex = 0;

//     for (const paragraph of paragraphs) {
//         const paragraphWords = paragraph.trim().split(/\s+/);
//         const paragraphWordCount = paragraphWords.length;
//     }

//     if(paragraphWordCount > chunkSize){
//         if(currenthunk.length > 0){
//             chunks.push({
//                 content: currentChunk.join('\n\n'),
//                 chunkIndex: chunkIndex++,
//                 pageNumber: 0
//             });
//             currentChunk = [];
//             currentWordCount = 0;
//         }

//         for(let i = 0 ; i < paragraphWords.length ; i += (chunSize - overlap)){
//             const chunkWords = paragraphWords.slice(i, i + chunkSize);
//             chunkIndex.push({
//                 content: chunkWords.join(' '),
//                 chunkIndex: chunkIndex++,
//                 pageNumber: 0
//             });

//             if (i+ chunkSize >= paragraphwords.length) break;
//         }
//         continue;
//     }

//     if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0){
//         chunks.push({
//             content: currentChunk.join('\n\n'),
//             chunkIndex: chunkIndex++,
//             pageNumber: 0
//         });

//         const prevChunkText = currentChunk.join(' ');
//         const prevWords = prevChunkText.split(/\s+/);
//         const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

//         currentChunk = [];
//         currentWordCount = overlap.split(/\s+/).length + paragraphWordCount;
//     }else {
//         currentChunk.push(paragraph.trim());
//         currentWordCount += paragraphWordCount;
//     }

//     if ( chunks.length === 0 && cleanedText.length > 0){
//         const allWords = cleanedText.split(/\s+/);
//         for(let i = 0 ; i < allWords.length ; i += (chunkSize - overlap)){
//             const chunkWords = allWords.slice(i, i + chunkSize);
//             chunks.push({
//                 content: chunkWords.join(' '),
//                 chunkIndex: chunkIndex++,
//                 pageNumber: 0
//             });

//             if ( i + chunkSize >= allWords.length) break;
//         }
//     }

//     return chunks;
// };

// /**
//  * Find relevent chunks based on keyword matching
//  * @param {Array<Object>} chunks - Array of chunks
//  * @param {string} query - Search query
//  * @param {number} maxChunks - maximum chunks to return
//  * @returns {Array<Object>}
//  */

// export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
//     if(!chunks || chunks.length === 0 || !query){
//         return [];
//     }

//     const stopWords = new Set([
//         'the','is','at','which','on','a','an','and','or','but','in','with','to','for','of','as','by','this','that','it'
//     ]);


//     const queryWords = query.toLowerCase().split(/\s+/).filter(w=>w.length > 2 && !stopWords.has(w));


//     if(queryWords.length === 0){
//         return chunks.slice(0, maxChunks).map(chunk => ({
//             content: chunk.content,
//             chunkIndex: chunk.chunkIndex,
//             pageNumber: chunk.pageNumber,
//             _id: chunk._id
//         }));
//     }

//     const scoredChunks = chunks.map((chunk, index) => {
//         const content = chunk.content.toLowerCase();
//         const contentWords = content.split(/\s+/).length;
//         let score = 0;


//         for(const word of queryWords){
//             const exactMatches = (content.match(new RegExp(`\\b${word}\\b`,'g')) || []).length;
//             score += exactMatches * 3;

//             const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
//             score += Math.max(0, partialMatches - exactMatches) * 1.5
//         }

//         const uniqueWordsFound = queryWords.filter(word => content.includes(words)).length;
//         if(uniqueWordsFound > 1){
//             score += uniqueWordsFound * 2;
//         }

//         const normalizedScore = score / Math.sqrt(contentWords);
//         const positionBomus = 1 - (index / chunks.length) *1.2;

//         return {
//             content: chunk.content,
//             chunkIndex: chunk.chunkIndex,
//             pageNumber: chunk.pageNumber,
//             _id: chunk._id,
//             score: normalizedScore * positionBomus,
//             rawScore: score,
//             matchedWords: uniqueWordsFound
//         };
//     });

//     return scoredChunks.filter(chunks => chunk.score > 0).sort((a, b) => {
//         if(b.score !== a.score){
//             return b.score - a.score;
//         }
//         if(b.matchedWords !== a.matchedWords){
//             return b.matchedWords - a.matchedWords;
//         }
//         return a.chunkIndex - b.chunkIndex;
//     }).slice(0, maxChunks);
// };


/**
 * Split text into chunks for AI processing.
 * @param {string} text
 * @param {number} chunkSize - Target words per chunk
 * @param {number} overlap - Overlapping words
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || !text.trim()) return [];

    if (
        !Number.isInteger(chunkSize) ||
        !Number.isInteger(overlap) ||
        chunkSize <= 0 ||
        overlap < 0 ||
        overlap >= chunkSize
    ) {
        throw new Error("Invalid chunkSize or overlap");
    }

    const cleanedText = text
        .replace(/\r\n?/g, "\n")
        .trim();

    const paragraphs = cleanedText
        .split(/\n+/)
        .map(p => p.trim())
        .filter(Boolean);

    const chunks = [];
    let currentWords = [];

    const addChunk = words => {
        if (!words.length) return;

        chunks.push({
            content: words.join(" "),
            chunkIndex: chunks.length,
            pageNumber: 0
        });
    };

    for (const paragraph of paragraphs) {
        const words = paragraph.split(/\s+/);

        for (const word of words) {
            currentWords.push(word);

            if (currentWords.length >= chunkSize) {
                addChunk(currentWords);

                currentWords = currentWords.slice(
                    chunkSize - overlap
                );
            }
        }
    }

    if (currentWords.length > 0) {
        addChunk(currentWords);
    }

    return chunks;
};


/**
 * Find relevant chunks using keyword matching.
 * @param {Array<Object>} chunks
 * @param {string} query
 * @param {number} maxChunks
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (
    chunks,
    query,
    maxChunks = 3
) => {
    if (!Array.isArray(chunks) || !chunks.length || !query?.trim()) {
        return [];
    }

    const stopWords = new Set([
        "the", "is", "at", "which", "on", "a", "an",
        "and", "or", "but", "in", "with", "to", "for",
        "of", "as", "by", "this", "that", "it"
    ]);

    const queryWords = [
        ...new Set(
            query.toLowerCase()
                .match(/\b[\p{L}\p{N}]+\b/gu) || []
        )
    ].filter(word => word.length > 2 && !stopWords.has(word));

    if (!queryWords.length) {
        return chunks.slice(0, maxChunks).map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }));
    }

    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase();
        const contentWords = content.match(/\b[\p{L}\p{N}]+\b/gu) || [];
        const wordCounts = new Map();

        for (const word of contentWords) {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }

        let score = 0;
        let matchedWords = 0;

        for (const word of queryWords) {
            const exactMatches = wordCounts.get(word) || 0;

            if (exactMatches > 0) {
                matchedWords++;
                score += exactMatches * 3;
            } else if (content.includes(word)) {
                score += 1;
            }
        }

        const normalizedScore =
            score / Math.sqrt(Math.max(contentWords.length, 1));

        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore,
            rawScore: score,
            matchedWords
        };
    });

    return scoredChunks
        .filter(chunk => chunk.score > 0)
        .sort((a, b) =>
            b.score - a.score ||
            b.matchedWords - a.matchedWords ||
            a.chunkIndex - b.chunkIndex
        )
        .slice(0, Math.max(0, maxChunks));
};

