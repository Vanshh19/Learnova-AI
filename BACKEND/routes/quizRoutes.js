import express from 'express';
import { 
    getQuizzes,
    getQuizByid,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();


router.use(protect);

router.get('/:documentId', getQuizzes);
router.get('/quiz/:id', getQuizByid);
router.post('/:Id/submit', submitQuiz);
router.get('/:Id/results', getQuizResults);
router.delete('/:id', deleteQuiz);


export default router;