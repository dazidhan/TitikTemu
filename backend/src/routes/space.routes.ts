import { Router } from 'express';
import {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpaceBookedSlots,
} from '../controllers/space.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getSpaces);
router.get('/:id', getSpaceById);
router.get('/:id/bookings', getSpaceBookedSlots);
router.post('/', protect, adminOnly, createSpace);
router.put('/:id', protect, adminOnly, updateSpace);
router.delete('/:id', protect, adminOnly, deleteSpace);

export default router;
