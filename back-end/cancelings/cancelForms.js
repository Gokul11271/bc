import mongoose from 'mongoose';

const cancelingSchema = new mongoose.Schema({
    bookingid: { type: String, required: true },
    name: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    department: { type: String, required: true },
    reason: { type: String, required: true }, 
    status: { type: String, default: "pending" },
},
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Canceling = mongoose.model('Canceling', cancelingSchema);

export default Canceling;
