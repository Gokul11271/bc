import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Booking Form</Link>
                </li>
                <li>
                    <Link to="/admin">Admin Dashboard</Link>
                </li>
                <li>
                    <Link to="/cancel">Cancel Form</Link>
                </li>
                <li>
                    <Link to="/login">login Form</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
