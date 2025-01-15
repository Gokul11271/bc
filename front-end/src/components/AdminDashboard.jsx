import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [cancelRequests, setCancelRequests] = useState([]);
    const [disapprovedBookings, setDisapprovedBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all required data from the backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsResponse, cancelRequestsResponse, disapprovedResponse] = await Promise.all([
                    axios.get("http://localhost:5000/bookings"),
                    axios.get("http://localhost:5000/canceling"),
                    axios.get("http://localhost:5000/disapprovedbookings"),
                ]);

                setBookings(bookingsResponse.data.data || []);
                setCancelRequests(cancelRequestsResponse.data.data || []);
                setDisapprovedBookings(disapprovedResponse.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error.message);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Update booking status
    const updateBookingStatus = async (id, status) => {
        try {
            const response = await axios.patch(`http://localhost:5000/bookings/${id}`, { status });
            if (response.data.success) {
                alert(`Booking ${status} successfully!`);
                setBookings(bookings.map(booking =>
                    booking._id === id ? { ...booking, status } : booking
                ));
                if (status === "disapproved") {
                    setDisapprovedBookings([...disapprovedBookings, response.data.data]);
                }
            }
        } catch (error) {
            console.error("Error updating booking status:", error.message);
            alert("Failed to update booking status.");
        }
    };

    // Update cancelation request status
    const updateCancelStatus = async (id, status) => {
        try {
            const response = await axios.patch(`http://localhost:5000/canceling/${id}`, { status });
            if (response.data.success) {
                alert(`Cancelation request ${status} successfully!`);
                setCancelRequests(cancelRequests.map(request =>
                    request._id === id ? { ...request, status } : request
                ));
                if (status === "approved") {
                    setBookings(bookings.filter(booking => booking._id !== response.data.data.bookingid));
                }
            }
        } catch (error) {
            console.error("Error updating cancelation status:", error.message);
            alert("Failed to update cancelation status.");
        }
    };

    if (loading) return <p>Loading data...</p>;

    return (
        <div>
            <h1>Admin Dashboard</h1>

            {/* Bookings Table */}
            <h2>Bookings</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Booking Id</th>
                        <th>Name</th>
                        <th>MobileNumber</th>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking._id}>
                            <td>{booking._id}</td>
                            <td>{booking.name}</td>
                            <td>{booking.mobileNumber}</td>
                            <td>{booking.eventName}</td>
                            <td>{new Date(booking.dateofBooking).toLocaleDateString()}</td>
                            <td>{booking.duration}</td>
                            <td>{booking.department}</td>
                            <td>{booking.status}</td>
                            <td>
                                {booking.status === "approved" && (
                                    <button onClick={() => updateBookingStatus(booking._id, "disapproved")}>
                                        Disapprove
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Cancelation Requests Table */}
            <h2>Cancelation Requests</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cancelRequests.map(request => (
                        <tr key={request._id}>
                            <td>{request.name}</td>
                            <td>{request.department}</td>
                            <td>{request.reason}</td>
                            <td>{request.status}</td>
                            <td>
                                {request.status === "pending" && (
                                    <>
                                        <button onClick={() => updateCancelStatus(request._id, "approved")}>
                                            Approve
                                        </button>
                                        <button onClick={() => updateCancelStatus(request._id, "disapproved")}>
                                            Disapprove
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Disapproved Bookings Table */}
            <h2>Disapproved Bookings</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Mobile Number</th>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Department</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {disapprovedBookings.map(booking => (
                        <tr key={booking._id}>
                            <td>{booking.name}</td>
                            <td>{booking.mobileNumber}</td>
                            <td>{booking.eventName}</td>
                            <td>{new Date(booking.dateofBooking).toLocaleDateString()}</td>
                            <td>{booking.duration}</td>
                            <td>{booking.department}</td>
                            <td>{booking.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
