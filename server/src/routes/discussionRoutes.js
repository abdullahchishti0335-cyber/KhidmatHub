import express from 'express';
import {
  addComment,
  getProjectComments,
  deleteComment,
} from '../controllers/discussionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/project/:projectId', getProjectComments);
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
