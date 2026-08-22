import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post(
  '/',
  protect,
  authorize('manager', 'admin'),
  upload.single('image'),
  createProject
);
router.put(
  '/:id',
  protect,
  authorize('manager', 'admin'),
  upload.single('image'),
  updateProject
);
router.delete('/:id', protect, authorize('manager', 'admin'), deleteProject);

export default router;
