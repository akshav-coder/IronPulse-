import express from 'express';
import multer from 'multer';
import {
  createMember,
  getMembersByGym,
  getMemberById,
  updateMember,
  deleteMember,
  getMyMemberProfile,
  importMembersCsv,
  getPendingMembers,
  approvePendingMember,
  rejectPendingMember,
  getUnassignedMembers,
} from '../controllers/memberController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Apply auth middleware to protect all routes
router.use(protect);

// Routes configuration
router.route('/')
  .post(authorize('owner'), createMember);

router.get('/profile/me', getMyMemberProfile);

router.post('/import', authorize('owner'), upload.single('file'), importMembersCsv);

router.get('/gym/:gym_id/pending', getPendingMembers);
router.get('/gym/:gym_id/unassigned', getUnassignedMembers);
router.put('/:id/approve', approvePendingMember);
router.put('/:id/reject', rejectPendingMember);

router.route('/gym/:gym_id')
  .get(getMembersByGym);

router.route('/:id')
  .get(getMemberById)
  .put(updateMember)
  .delete(authorize('owner'), deleteMember);

export default router;
