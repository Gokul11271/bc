import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const CancelForm = () => {
    const [formData, setFormData] = useState({
        bookingid: '',
        name: '',
        mobilenumber: '',
        department: '',
        reason: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!Object.values(formData).every((field) => field.trim() !== "")) {
            alert("All fields are required!");
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/canceling', formData);
            alert('Cancel request sent successfully!');
        } catch (error) {
            console.error("Error submitting cancel request:", error.message);
            alert('Failed to submit cancel request.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Canceling Form</h1>
            <input type="text" name="bookingid" placeholder="Booking ID" onChange={handleChange} />
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} />
            <input type="text" name="mobilenumber" placeholder="Mobile Number" onChange={handleChange} />
            <input type="text" name="department" placeholder="Department" onChange={handleChange} />
            <input type="text" name="reason" placeholder="Reason" onChange={handleChange} />
            <button type="submit">Submit Cancel Request</button>
        </form>
    );
};

export default CancelForm;
