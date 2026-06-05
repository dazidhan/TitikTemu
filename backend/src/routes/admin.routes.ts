import { Router } from 'express';
import { getStats, getAllBookings, updateAnyBooking, getAllUsers } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id', updateAnyBooking);
router.get('/users', getAllUsers);

export default router;
