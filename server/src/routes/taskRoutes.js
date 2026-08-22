import express from 'express';
import {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/my', getMyTasks);
router.get('/project/:projectId', getProjectTasks);
router.put('/:id/status', upload.single('attachment'), updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;
