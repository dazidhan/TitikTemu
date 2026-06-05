import { Response, NextFunction } from 'express';
import { Booking } from '../models/booking.model';
import { Space } from '../models/space.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [
      totalUsers,
      totalSpaces,
      totalBookings,
      activeBookings,
      todayRevenue,
      pendingBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Space.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['pending', 'paid'] }, date: { $gte: today } }),
      Booking.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Booking.countDocuments({ status: 'pending' }),
    ]);

    const availableSpaces = await Space.countDocuments({ status: 'available' });
    const occupancyRate = totalSpaces > 0
      ? Math.round(((totalSpaces - availableSpaces) / totalSpaces) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSpaces,
        totalBookings,
        activeBookings,
        pendingBookings,
        todayRevenue: todayRevenue[0]?.total || 0,
        occupancyRate,
        availableSpaces,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, date } = req.query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (date) {
      const d = new Date(date as string);
      d.setHours(0, 0, 0, 0);
      filter.date = d;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('space', 'name type images pricePerHour location')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const updateAnyBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user space');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};
