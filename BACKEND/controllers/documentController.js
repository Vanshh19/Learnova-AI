import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/FlashCard.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs, { readSync } from "fs";
import mongoose from "mongoose";

export const uploadDocument = async (req, res, next) => {
    try  {
        if(!req.file){
            return res.status(400).json({
                success: false,
                error: "Please upload a PDF file",
                statusCode: 400
            });
        }

        const { title } = req.body;

        if(!title) {
            // Delete uploaded one
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: "Please provide a document title",
                statusCode: 400
            });
        }

        // construct URL
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        // create docs
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: 'processing'
        });

        // PDF background
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document upload successfully. Processing in progress...'
        });

    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(()=>{});
        }
        next(error);
    }
};

const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);


        const chunks = chunkText(text, 500, 50);


        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);
    }catch(error){
        console.error(`Error processing document ${documentId}:`,error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};


export const getDocuments = async (req, res, next) => {
    try  {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id)}
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardcount: { $size: '$flashcardSets'},
                    quizCount: { $size: '$quizzes'}
                }
            },
            {
                $project: {
                    extractedtext: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uplaodDate: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
};





export const getDocument = async (req, res, next) => {
    try  {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id});


        document.lastAcessed = Date.now();
        await document.save();

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });
    } catch (error) {
        next(error);
    }
};


export const deleteDocument = async (req, res, next) => {
    try  {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        await fs.unlink(document.filepath).catch(() => {});

        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};




