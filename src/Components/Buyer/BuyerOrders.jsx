import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../api/client';

import {
    faLeaf,
    faSignOutAlt,
    faUserCircle,
    faSearch,
    faBoxOpen,
    faShoppingCart,
    faClock,
    faCheckCircle,
    faTruck,
    faTimesCircle,
    faExclamationCircle,
    faUndo
} from '@fortawesome/free-solid-svg-icons';

function BuyerOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buyer, setBuyer] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    // Initialize cart count from localStorage
    useEffect(() => {
       const email = localStorage.getItem("email")?.toLowerCase();
        if (email) {
            const cart = JSON.parse(localStorage.getItem(`cart-${email}`)) || [];
            setCartCount(cart.reduce((total, item) => total + (item.cartQuantity || 1), 0));
        }
    }, []);

    // Fetch buyer details
    useEffect(() => {
        const email = localStorage.getItem("email")?.toLowerCase();
        if (email) {
            apiClient.get(`/api/buyer/${email}`)
                .then(res => setBuyer(res.data))
                .catch(err => console.error("Failed to load buyer", err));
        }
    }, []);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
    try {
        const email = localStorage.getItem("email")?.toLowerCase();
        if (!email) {
            navigate('/signin');
            return;
        }
        
        const response = await apiClient.get(`/api/orders/buyer/${email}`);
        const data = response.data;

        if (!data || data.length === 0) {
            setOrders([]);
            setLoading(false);
            return;
        }
        
        const formattedOrders = data.map(order => {
            const quantity = order.quantity || 1;
            const totalPrice = order.totalPrice || 0;
            
            return {
                ...order,
                orderDate: order.bookingDate || order.orderDate || new Date().toISOString(),
                items: [{
                    cropName: order.crop?.cropName || order.cropName || "Unknown Crop",
                    farmerName: order.farmer?.name || order.farmerName || "Unknown Farmer",
                    quantity: quantity,
                    pricePerUnit: totalPrice / quantity,
                    totalPrice: totalPrice,
                    cropImageUrl: order.cropImageUrl || ""
                }],
                totalAmount: totalPrice
            };
        });
        
        setOrders(formattedOrders);
        setLoading(false);
    } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || err.message || "Failed to load orders. Please try again later.");
        setLoading(false);
    }
};
        fetchOrders();
    }, [navigate]);

    const handleLogout = () => {
        const email = localStorage.getItem("email");
        if (email) {
            localStorage.removeItem(`cart-${email}`);
            localStorage.removeItem("email");
        }
        navigate('/signin');
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    icon: faClock,
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-50',
                    text: 'Waiting for farmer confirmation'
                };
            case 'CONFIRMED':
                return {
                    icon: faCheckCircle,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-50',
                    text: 'Farmer has accepted your order'
                };
            case 'SHIPPED':
                return {
                    icon: faTruck,
                    color: 'text-purple-500',
                    bgColor: 'bg-purple-50',
                    text: 'Your order is on the way'
                };
            case 'DELIVERED':
                return {
                    icon: faCheckCircle,
                    color: 'text-green-500',
                    bgColor: 'bg-green-50',
                    text: 'Delivered successfully'
                };
            case 'REJECTED':
                return {
                    icon: faTimesCircle,
                    color: 'text-red-500',
                    bgColor: 'bg-red-50',
                    text: 'Order was rejected'
                };
            case 'CANCELLED':
                return {
                    icon: faExclamationCircle,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-50',
                    text: 'Order was cancelled'
                };
            default:
                return {
                    icon: faClock,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-50',
                    text: 'Processing'
                };
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleReorder = (order) => {
        toast.info('Reorder functionality coming soon!');
    };

    const handleTrackOrder = (orderId) => {
        toast.info('Order tracking coming soon!');
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col">
            {/* Navbar */}
            <header className="bg-white shadow px-6 py-4">
                <div className="flex justify-between items-center">
                    <Link
                        to="/BuyerHomePage"
                        className="text-green-700 font-bold text-2xl flex items-center hover:opacity-80"
                    >
                        <FontAwesomeIcon icon={faLeaf} className="mr-2 text-green-600 animate-pulse" />
                        Krishiमित्र
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link to="/buyer/cart" className="text-gray-600 hover:text-gray-800 relative">
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="relative">
                            <button 
                                onClick={() => navigate('/buyer/profile')} 
                                className="flex items-center"
                            >
                                <FontAwesomeIcon
                                    icon={faUserCircle}
                                    size="lg"
                                    className="text-gray-600 hover:text-gray-800"
                                />
                                <span className="ml-2 hidden md:inline">
                                    {buyer?.name || 'Profile'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 flex-grow">
                {/* Welcome Section */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                                <FontAwesomeIcon icon={faBoxOpen} size="lg" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Your Orders</h2>
                                <p className="text-gray-600">Track and manage your purchases</p>
                            </div>
                        </div>
                        <Link
                            to="/BuyerHomePage"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* Orders Section */}
                <section className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Order History</h3>
                        <div className="text-sm text-gray-500">
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <FontAwesomeIcon 
                                icon={faBoxOpen} 
                                className="text-gray-300 text-5xl mb-4 mx-auto" 
                            />
                            <h4 className="text-xl font-medium text-gray-600">No orders yet</h4>
                            <p className="text-gray-500 mt-2">You haven't placed any orders yet</p>
                            <Link
                                to="/BuyerHomePage"
                                className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const statusDetails = getStatusDetails(order.status);
                                return (
                                    <div key={order.id} className="border rounded-lg overflow-hidden">
                                        <div className={`${statusDetails.bgColor} px-6 py-3 flex justify-between items-center`}>
                                            <div className="flex items-center">
                                                <FontAwesomeIcon 
                                                    icon={statusDetails.icon} 
                                                    className={`${statusDetails.color} mr-2`} 
                                                />
                                                <span className="font-medium">
                                                    {statusDetails.text}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Ordered on {formatDate(order.orderDate)}
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 border-b">
                                            <div className="flex justify-between">
                                                <div>
                                                    <span className="font-medium">Order #{order.id}</span>
                                                </div>
                                                <div className="text-sm">
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
                                            {order.items.map((item, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`flex pb-4 ${index !== order.items.length - 1 ? 'border-b mb-4' : ''}`}
                                                >
                                                    <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                                                        {item.cropImageUrl ? (
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL}${item.cropImageUrl}`}
                                                                alt={item.cropName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                <FontAwesomeIcon icon={faLeaf} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="font-medium">{item.cropName}</h4>
                                                        <p className="text-sm text-gray-600">Sold by: {item.farmerName}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {item.quantity} kg × ₹{item.pricePerUnit.toFixed(2)}/kg
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">₹{item.totalPrice.toFixed(2)}</p>
                                                        {order.status === 'DELIVERED' && (
                                                            <button 
                                                                onClick={() => handleReorder(item)}
                                                                className="mt-2 text-xs text-green-600 hover:underline flex items-center"
                                                            >
                                                                <FontAwesomeIcon icon={faUndo} className="mr-1" />
                                                                Reorder
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
                                            <div>
                                                <span className="text-sm text-gray-600">Total:</span>
                                                <span className="ml-2 font-medium">₹{order.totalAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex space-x-2">
                                                {order.status !== 'REJECTED' && order.status !== 'CANCELLED' && (
                                                    <button 
                                                        onClick={() => handleTrackOrder(order.id)}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        Track Order
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => navigate(`/buyer/orders/${order.id}`)}
                                                    className="text-sm text-gray-600 hover:underline"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="text-center text-gray-500 py-4 text-sm bg-gray-100">
                © {new Date().getFullYear()} CropBoom. All rights reserved.
            </footer>
        </div>
    );
}

export default BuyerOrders;