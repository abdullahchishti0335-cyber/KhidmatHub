import express from 'express';
import {
  applyToProject,
  getMyApplications,
  getProjectApplications,
  reviewApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.post('/', applyToProject);
router.get('/my', getMyApplications);
router.get('/project/:projectId', authorize('manager', 'admin'), getProjectApplications);
router.put('/:id/review', authorize('manager', 'admin'), reviewApplication);

export default router;
