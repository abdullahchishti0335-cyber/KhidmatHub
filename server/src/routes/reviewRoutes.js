import express from 'express';
import { addReview, getProjectReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/project/:projectId', getProjectReviews);
router.post('/', protect, addReview);

export default router;
