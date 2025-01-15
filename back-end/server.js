import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import Booking from './bookings/users.booking.js';
import Canceling from './cancelings/cancelForms.js';
import DisapprovedBooking from './bookings/DisapprovedBooking.js'; 
import Login from './logins/login.model.js';
import cors from 'cors';
import twilio from 'twilio';

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// Connect to the database
connectDB();

// Twilio configuration
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  const whatsappNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  

// Routes
app.get("/bookings", async (req, res) => {
    try {
      const bookings = await Booking.find();
  
      const bookingsByDate = bookings.reduce((acc, booking) => {
        const date = booking.dateofBooking;
        if (!acc[date]) acc[date] = [];
        acc[date].push(booking);
        return acc;
      }, {});
  
      const normalizedBookings = Object.entries(bookingsByDate).flatMap(([date, bookings]) => {
        const durations = bookings.map(booking => booking.duration);
        const fullDay = durations.includes("Morning") && durations.includes("Afternoon");
  
        return bookings.map(booking => ({
          ...booking.toObject(),
          duration: fullDay ? "Full day" : booking.duration,
        }));
      });
  
      res.status(200).json({ success: true, data: normalizedBookings });
    } catch (error) {
      console.error("Error fetching bookings:", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

app.post("/booking", async (req, res) => {
    try {
      const { name, mobileNumber, eventName, dateofBooking, duration, department } = req.body;

      if (!name || !mobileNumber || !eventName || !dateofBooking || !duration || !department) {
        return res.status(400).json({ success: false, message: "All fields are required." });
      }

      const newBooking = new Booking(req.body);
      await newBooking.save();

      const messageBody = `Hello ${name}, your booking for the event "${eventName}" on ${dateofBooking} has been successfully submitted and approved. Thank you! Booking ID: ${newBooking._id}`;

      console.log("Preparing to send WhatsApp message...");
      await client.messages.create({
        body: messageBody,
        from: whatsappNumber,
        to: `whatsapp:+91${mobileNumber}`
      });
      console.log("WhatsApp message sent successfully.");

      res.status(201).json({ success: true, data: newBooking });
    } catch (error) {
      console.error("Error in booking:", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
});


app.patch("/bookings/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'disapproved'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (status === "disapproved") {
            const disapprovedBooking = new DisapprovedBooking({
                name: booking.name,
                mobileNumber: booking.mobileNumber,
                eventName: booking.eventName,
                dateofBooking: booking.dateofBooking,
                duration: booking.duration,
                department: booking.department,
                status: "disapproved",
            });

            await disapprovedBooking.save();
            await Booking.findByIdAndDelete(booking._id);

            // Notify user about disapproval
            await client.messages.create({
                body: `Hello ${booking.name}, your booking for the event "${booking.eventName}" on ${booking.dateofBooking} has been disapproved.`,
                from: whatsappNumber,
                to: `whatsapp:+91${booking.mobileNumber}`
            });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error("Error updating booking status:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/disapprovedbookings", async (req, res) => {
    try {
        // Fetch all disapproved bookings
        const disapprovedbookings = await DisapprovedBooking.find();

        // Group disapproved bookings by date and adjust durations
        const disapprovedbookingsByDate = disapprovedbookings.reduce((acc, booking) => {
            const date = booking.dateofBooking;
            if (!acc[date]) acc[date] = [];
            acc[date].push(booking);
            return acc;
        }, {});

        // Normalize disapproved bookings data
        const normalizeddisapprovedbookings = Object.entries(disapprovedbookingsByDate).flatMap(([date, disapprovedbookings]) => {
            const durations = disapprovedbookings.map(booking => booking.duration);
            const fullDay = durations.includes("Morning") && durations.includes("Afternoon");

            // Return disapproved bookings with adjusted duration
            return disapprovedbookings.map(booking => ({
                ...booking.toObject(),
                duration: fullDay ? "Full day" : booking.duration,
            }));
        });

        res.status(200).json({ success: true, data: normalizeddisapprovedbookings });
    } catch (error) {
        console.error("Error fetching disapproved bookings:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


app.post("/canceling", async (req, res) => {
    console.log("Received data:", req.body);
    try {
        const { bookingid, name, mobilenumber, department, reason } = req.body;
        if (!bookingid || !name || !mobilenumber || !department || !reason) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        const newCanceling = new Canceling(req.body);
        await newCanceling.save();
        res.status(201).json({ success: true, data: newCanceling });
    } catch (error) {
        console.error("Error in Canceling", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


app.get("/canceling", async (req, res) => {
    try {
        const cancelRequests = await Canceling.find(); // Fetch all cancelation requests
        res.status(200).json({ success: true, data: cancelRequests });
    } catch (error) {
        console.error("Error fetching cancelation requests:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.patch("/canceling/:id", async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        if (!["approved", "disapproved"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        // Update cancellation request status
        const canceling = await Canceling.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!canceling) {
            return res.status(404).json({ success: false, message: "Cancellation request not found" });
        }

        let messageBody;

        // Handle approved or disapproved status
        if (status === "approved") {
            const deletedBooking = await Booking.findByIdAndDelete(canceling.bookingid);
            if (!deletedBooking) {
                return res.status(404).json({ success: false, message: "Associated booking not found" });
            }
            messageBody = `Hello ${canceling.name}, your cancellation request for booking ID: ${canceling.bookingid} has been approved. The booking has been canceled successfully.`;
        } else {
            messageBody = `Hello ${canceling.name}, your cancellation request for booking ID: ${canceling.bookingid} has been disapproved. The booking remains active.`;
        }

        // Send WhatsApp message notification
        await client.messages.create({
            body: messageBody,
            from: whatsappNumber,
            to: `whatsapp:+91${canceling.mobilenumber}`
        });

        res.status(200).json({ success: true, data: canceling });
    } catch (error) {
        console.error("Error updating cancellation request status:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if all fields are provided
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Enter all fields" });
        }

        // Find user by email
        const user = await Login.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = password === user.password; // Simplified for testing
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Respond with success
        res.status(200).json({
            success: true,
            message: `${user.role} login successful`,
            role: user.role,
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
