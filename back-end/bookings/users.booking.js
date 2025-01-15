import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    eventName: { type: String, required: true },
    dateofBooking: { type: String, required: true },
    duration: { type: String, required: true },
    department: { type: String, required: true },
    status: { type: String, enum: ['approved', 'disapproved'], default: 'approved' }, // Add status
},
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
