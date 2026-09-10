import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarCheck, faCheckCircle, faTimesCircle, faTruck, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const BookingsPage = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const email = localStorage.getItem("email");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/farmer/${email}`);
        
        const formattedBookings = response.data.map(booking => ({
          id: booking.id,
          cropName: booking.cropName || "Unknown Crop",
          quantity: booking.quantity || 0,
          unit: booking.unit || "kg",
          buyerName: booking.buyerName || "Unknown Buyer",
          buyerEmail: booking.buyerEmail || "no-email@example.com",
          buyerPhone: booking.buyerPhone ? booking.buyerPhone : "Not provided",
          bookingDate: booking.bookingDate || new Date().toISOString(),
          status: (booking.status || "pending").toLowerCase(),
          paymentStatus: booking.paymentStatus || "pending",
          price: booking.price || `₹${booking.totalPrice || 0}`,
          deliveryAddress: booking.deliveryAddress || "Address not specified",
          buyerId: booking.buyerId
        }));

        setBookings(formattedBookings);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleDelivery = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      await axios.put(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}/status`, null, {
        params: { status: 'confirmed' }
      });

      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'confirmed' } : b
      ));

      alert('Order confirmed!');
    } catch (err) {
      console.error("Failed to update delivery status:", err);
      alert('Failed to confirm order. Please try again.');
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/payment`, null, {
        params: { paymentStatus: 'paid' }
      });
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, paymentStatus: 'paid' } : booking
      ));
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };


  if (loading) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-green-700 text-xl">Loading bookings...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-red-600 text-xl">Error: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Link to="/FarmerHomePage" className="mr-4 text-green-700 hover:text-green-900">
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </Link>
          <h1 className="text-3xl font-bold text-green-800 flex items-center">
            <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
            Your Crop Bookings
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-green-800 font-medium">Total Bookings</h3>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-blue-800 font-medium">Confirmed</h3>
              <p className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-yellow-800 font-medium">Pending</h3>
              <p className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 p-6 pb-0">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{booking.cropName}</div>
                      <div className="text-sm text-gray-500">
                        {booking.quantity} {booking.unit} • {booking.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{booking.buyerName}</div>
                      <div className="text-sm text-gray-500">{booking.buyerEmail}</div>
                      <div className="text-sm text-gray-500">{booking.buyerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'confirmed' ? (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Confirmed
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Pending
                          </>
                        )}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        Payment: {booking.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDelivery(booking.id)}
                        disabled={booking.status === 'confirmed'}
                        className={`mr-4 ${booking.status === 'confirmed' 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-green-600 hover:text-green-900'}`}
                      >
                        <FontAwesomeIcon icon={faTruck} className="mr-1" /> Delivery
                        </button>
                      <button 
                        onClick={() => handlePayment(booking.id)}
                        disabled={booking.paymentStatus === 'paid'}
                        className={booking.paymentStatus === 'paid' 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:text-blue-900'}
                      >
                        <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1" /> Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Instructions</h2>
          <p className="text-gray-600 mb-4">
            For confirmed bookings, please ensure timely delivery as per the agreed terms.
            Contact the buyer if there are any changes or delays.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">
              <strong>Note:</strong> Mark bookings as delivered once completed to update your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;