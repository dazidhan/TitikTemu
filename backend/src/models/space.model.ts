import mongoose, { Document, Schema } from 'mongoose';

export interface ISpace extends Document {
  name: string;
  description: string;
  type: 'Hot Desk' | 'Meeting Room' | 'Private Office' | 'Studio' | 'Event Space';
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  images: string[];
  location: string;
  status: 'available' | 'maintenance' | 'unavailable';
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: Date;
}

const SpaceSchema = new Schema<ISpace>(
  {
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: String,
      enum: ['Hot Desk', 'Meeting Room', 'Private Office', 'Studio', 'Event Space'],
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'unavailable'],
      default: 'available',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Space = mongoose.model<ISpace>('Space', SpaceSchema);
