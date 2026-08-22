import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  reviewPendingProject,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.put('/projects/:id/review', reviewPendingProject);

export default router;
