import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/BookingForm.css';
import '../App.css';

const BookingForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        eventName: '',
        dateofBooking: '',
        duration: '',
        department: ''
    });

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        // Fetch existing bookings from server
        axios.get('http://localhost:5000/bookings')
            .then(response => {
                console.log("Fetched bookings:", response.data);
                setBookings(response.data.data); // Ensure correct response structure
            })
            .catch(error => {
                console.error("Error fetching bookings:", error.message);
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for empty fields
        if (!Object.values(formData).every((field) => field && field.toString().trim() !== "")) {
            alert("All fields are required!");
            return;
        }

        // Check if the selected date and duration are already booked
        const isSlotBooked = bookings.some(
            (booking) =>
                new Date(booking.dateofBooking).toDateString() === 
                new Date(formData.dateofBooking).toDateString() &&
                booking.duration === formData.duration
        );

        if (isSlotBooked) {
            alert(`The ${formData.duration} slot for this date is already booked. Please choose a different slot or date.`);
            return;
        }

        try {
            await axios.post('http://localhost:5000/booking', formData);
            alert('Booking successful!');

            // Refresh bookings to reflect new data
            const updatedBookings = await axios.get('http://localhost:5000/bookings');
            setBookings(updatedBookings.data.data);
        } catch (error) {
            console.error("Error submitting booking:", error.message);
            alert('Failed to submit booking.');
        }
    };

    // Get class for booking durations to highlight them on the calendar
    const getTileClass = ({ date }) => {
        const booking = bookings.find(
            (b) => new Date(b.dateofBooking).toDateString() === date.toDateString()
        );

        if (booking) {
            if (booking.duration === "Full day") return "full-day-booked";
            if (booking.duration === "Morning") return "morning-booked";
            if (booking.duration === "Afternoon") return "afternoon-booked";
        }
        return "";
    };

    // Disable fully booked dates on the calendar
    const isTileDisabled = ({ date }) => {
        const booking = bookings.find(
            (b) => new Date(b.dateofBooking).toDateString() === date.toDateString()
        );
        return booking?.duration === "Full day";
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Auditorium Booking Form</h1>
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} />
            <input type="text" name="mobileNumber" placeholder="Mobile Number" onChange={handleChange} />
            <input type="text" name="eventName" placeholder="Event Name" onChange={handleChange} />

            {/* Calendar Component */}
            <Calendar
                onChange={(date) => {
                    // Convert selected date to UTC (midnight)
                    const adjustedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

                    // Update the form data with normalized UTC date
                    setFormData({ ...formData, dateofBooking: adjustedDate.toISOString() });
                }}
                value={formData.dateofBooking ? new Date(formData.dateofBooking) : new Date()}
                tileClassName={({ date }) => getTileClass({ date })}
                tileDisabled={({ date }) => isTileDisabled({ date })}
            />

            <select name="duration" onChange={handleChange}>
                <option value="">Select Time Duration</option>
                <option value="Full day">Full day</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
            </select>
            <input type="text" name="department" placeholder="Department" onChange={handleChange} />
            <button type="submit">Submit Booking</button>
        </form>
    );
};

export default BookingForm;
