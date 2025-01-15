import mongoose from 'mongoose';

// Define the schema
const disapprovedBookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    eventName: { type: String, required: true },
    dateofBooking: { type: String, required: true },
    duration: { type: String, required: true },
    department: { type: String, required: true },
    status: { type: String, enum: ['disapproved'], default: 'disapproved' }, // Fixed status to 'disapproved'
}, 
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the model
const DisapprovedBooking = mongoose.model('DisapprovedBooking', disapprovedBookingSchema);

export default DisapprovedBooking;
