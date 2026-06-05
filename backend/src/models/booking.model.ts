import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBooking extends Document {
  user: Types.ObjectId;
  space: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  serviceFee: number;
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'Space',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    totalHours: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient double-booking queries
BookingSchema.index({ space: 1, date: 1, status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
