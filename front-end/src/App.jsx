import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar'; // Import Navbar
import CancelForm from './components/CancelForm';
import Login from './components/login';
const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<BookingForm />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/cancel" element={<CancelForm />} />
                <Route path="/login" element={<Login />} />
                
            </Routes>
        </Router>
    );
};

export default App;
