import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/booking.model';
import { Space } from '../models/space.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendBookingReceipt } from '../utils/email';
// @ts-ignore
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Helper: convert "HH:MM" to minutes for comparison
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { user: req.user?.id };

    const bookings = await Booking.find(filter)
      .populate('user', 'name email avatar')
      .populate('space', 'name type images pricePerHour location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email avatar phone')
      .populate('space', 'name type images pricePerHour location amenities');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Only allow access to own booking (unless admin)
    const bookingUserId = typeof booking.user === 'object' && booking.user !== null && '_id' in booking.user 
      ? String(booking.user._id) 
      : String(booking.user);
      
    if (req.user?.role !== 'admin' && bookingUserId !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { spaceId, date, startTime, endTime, paymentMethod, notes } = req.body;

    if (!spaceId || !date || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'spaceId, date, startTime, endTime are required.' });
      return;
    }

    // Validate time order
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      res.status(400).json({ success: false, message: 'startTime must be before endTime.' });
      return;
    }

    // Fetch space
    const space = await Space.findById(spaceId);
    if (!space) {
      res.status(404).json({ success: false, message: 'Space not found.' });
      return;
    }

    if (space.status !== 'available') {
      res.status(400).json({ success: false, message: `Space is currently ${space.status}.` });
      return;
    }

    // ── DOUBLE-BOOKING PREVENTION ──────────────────────────────────────────
    // Find any booking for the same space on the same date that overlaps
    // with the requested time range and is NOT cancelled.
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const conflict = await Booking.findOne({
      space: spaceId,
      date: bookingDate,
      status: { $nin: ['cancelled'] },
      $and: [
        { startTime: { $lt: endTime } },   // existing starts before new ends
        { endTime: { $gt: startTime } },   // existing ends after new starts
      ],
    });

    if (conflict) {
      res.status(409).json({
        success: false,
        message: `This space is already booked from ${conflict.startTime} to ${conflict.endTime}. Please choose a different time slot.`,
      });
      return;
    }
    // ──────────────────────────────────────────────────────────────────────

    // Calculate pricing
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const totalHours = (endMins - startMins) / 60;
    const subtotal = totalHours * space.pricePerHour;
    const serviceFee = Math.round(subtotal * 0.08 * 100) / 100; // 8% service fee
    const totalPrice = Math.round((subtotal + serviceFee) * 100) / 100;

    const booking = await Booking.create({
      user: req.user?.id,
      space: spaceId,
      date: bookingDate,
      startTime,
      endTime,
      totalHours,
      totalPrice,
      serviceFee,
      status: 'pending',
      paymentMethod,
      notes,
    });

    const populated = await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'space', select: 'name type images pricePerHour location' },
    ]);

    res.status(201).json({ success: true, booking: populated });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, paymentMethod } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Users can only cancel their own bookings
    if (req.user?.role !== 'admin') {
      if (String(booking.user) !== req.user?.id) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }
      if (status !== 'cancelled') {
        res.status(403).json({ success: false, message: 'Users can only cancel bookings.' });
        return;
      }
    }

    booking.status = status;
    if (paymentMethod) booking.paymentMethod = paymentMethod;

    // Simulate payment: pending → paid
    if (status === 'paid' && !booking.paymentMethod) {
      booking.paymentMethod = 'card';
    }

    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// GET Midtrans Snap Token
export const getMidtransToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('space', 'name');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const bookingUserId = typeof booking.user === 'object' && booking.user ? (booking.user as any)._id : booking.user;
    if (String(bookingUserId) !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ success: false, message: `Booking is already ${booking.status}.` });
      return;
    }

    const parameter = {
      transaction_details: {
        order_id: booking._id.toString() + '-' + Date.now(), // appended timestamp to prevent duplicate order_id errors in sandbox
        gross_amount: Math.round(booking.totalPrice)
      },
      item_details: [{
        id: (booking.space as any)._id.toString(),
        price: Math.round(booking.totalPrice),
        quantity: 1,
        name: (booking.space as any).name.substring(0, 50)
      }],
      customer_details: {
        first_name: (booking.user as any).name,
        email: (booking.user as any).email
      },
      callbacks: {
        finish: "http://localhost:3000/dashboard",
        error: "http://localhost:3000/dashboard",
        pending: "http://localhost:3000/dashboard"
      }
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ success: true, token: transaction.token });
  } catch (error) {
    next(error);
  }
};

// Simulate payment (PENDING → PAID) OR Handle Midtrans Webhook equivalent
export const processPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email company')
      .populate('space', 'name type');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const bookingUserId = typeof booking.user === 'object' && booking.user ? (booking.user as any)._id : booking.user;
    if (String(bookingUserId) !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ success: false, message: `Booking is already ${booking.status}.` });
      return;
    }

    const { paymentMethod } = req.body;

    // ── MIDTRANS HOOK ──────────────────────────────────────────────────────
    // TODO: Replace simulation below with real Midtrans Snap token generation
    // const midtransToken = await midtransCreateTransaction({ orderId: booking._id, amount: booking.totalPrice });
    // return res.json({ success: true, redirect: midtransToken.redirect_url });
    // ──────────────────────────────────────────────────────────────────────

    // Simulate immediate payment success
    booking.status = 'paid';
    booking.paymentMethod = paymentMethod || 'card';
    await booking.save();

    // ── SEND EMAIL RECEIPT ────────────────────────────────────────────────
    // booking.user and booking.space are populated objects now, but TS thinks they are ObjectIds.
    // We cast them or just pass them dynamically.
    await sendBookingReceipt(booking, booking.user, booking.space);
    // ──────────────────────────────────────────────────────────────────────

    res.json({
      success: true,
      message: 'Payment successful! Your booking is confirmed.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};
