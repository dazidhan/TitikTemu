import { Request, Response, NextFunction } from 'express';
import { Space } from '../models/space.model';
import { Booking } from '../models/booking.model';

export const getSpaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status, capacity, featured, search } = req.query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    else filter.status = { $ne: 'unavailable' };
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const spaces = await Space.find(filter).sort({ featured: -1, createdAt: -1 });

    res.json({ success: true, count: spaces.length, spaces });
  } catch (error) {
    next(error);
  }
};

export const getSpaceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) {
      res.status(404).json({ success: false, message: 'Space not found.' });
      return;
    }
    res.json({ success: true, space });
  } catch (error) {
    next(error);
  }
};

export const createSpace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const space = await Space.create(req.body);
    res.status(201).json({ success: true, space });
  } catch (error) {
    next(error);
  }
};

export const updateSpace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!space) {
      res.status(404).json({ success: false, message: 'Space not found.' });
      return;
    }
    res.json({ success: true, space });
  } catch (error) {
    next(error);
  }
};

export const deleteSpace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const space = await Space.findByIdAndDelete(req.params.id);
    if (!space) {
      res.status(404).json({ success: false, message: 'Space not found.' });
      return;
    }
    res.json({ success: true, message: 'Space deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getSpaceBookedSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required.' });
      return;
    }

    const bookingDate = new Date(date as string);
    bookingDate.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      space: req.params.id,
      date: bookingDate,
      status: { $nin: ['cancelled'] },
    }).select('startTime endTime');

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};
