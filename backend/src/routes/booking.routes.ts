import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  processPayment,
  getMidtransToken,
} from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id/status', updateBookingStatus);
router.get('/:id/midtrans-token', getMidtransToken);
router.post('/:id/pay', processPayment);

export default router;
