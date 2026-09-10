import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../api/client';
import {
    faLeaf,
    faArrowLeft,
    faMapMarkerAlt,
    faCalendarAlt,
    faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons';

function BuyNowPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [crops, setCrops] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [deliveryAddress, setDeliveryAddress] = useState('');
    // Set default delivery date to tomorrow
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state for submission

    const unitConversionToKg = {
        kg: 1,
        quintal: 100,
        ton: 1000
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const cropId = searchParams.get('cropId');

        const fetchCropDetails = async (id) => {
            try {
                const response = await apiClient.get(`/api/crops/${id}`);
                const data = response.data;
                const mapped = {
                    id: data.id,
                    cropName: data.cropName,
                    price: data.pricePerKg,
                    priceRange: data.priceRange,
                    unit: data.unit,
                    address: data.address,
                    cropImageUrl: data.cropImageUrl,
                    farmerName: data.farmerName,
                    farmerEmail: data.farmerEmail,
                    availableQuantity: data.quantity
                };

                setCrops([mapped]);
                setQuantities({ [mapped.id]: 1 });
            } catch (err) {
                console.error('Error fetching crop:', err);
                setError('Failed to load crop details');
            } finally {
                setLoading(false);
            }
        };

        if (cropId) {
            fetchCropDetails(cropId);
        } else if (location.state?.cartItems?.length > 0) {
            setCrops(location.state.cartItems);
            const initialQuantities = {};
            location.state.cartItems.forEach(item => {
                initialQuantities[item.id] = item.selectedQuantity || item.quantity || 1;
            });
            setQuantities(initialQuantities);
            setLoading(false);
        } else {
            setError('No crop or cart data provided');
            setLoading(false);
        }
    }, [location.search, location.state]);

    const calculateTotal = () => {
        return crops.reduce((sum, item) => {
            const quantity = quantities[item.id] || 1;
            let numericPrice = 0;

            if (item.price && item.price > 0) {
                numericPrice = item.price;
            } else if (item.priceRange) {
                const parts = item.priceRange.split('-').map(p => parseFloat(p));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    numericPrice = (parts[0] + parts[1]) / 2;
                }
            }

            return sum + numericPrice * quantity;
        }, 0).toFixed(2);
    };

    const validateForm = () => {
        const errors = [];
        if (!deliveryAddress.trim()) errors.push('Delivery address is required');
        if (!deliveryDate) errors.push('Delivery date is required');
        if (crops.some(crop => !quantities[crop.id] || quantities[crop.id] < 1)) {
            errors.push('Invalid quantities');
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const buyerEmail = localStorage.getItem("email");
        const crop = crops[0];
        if (!buyerEmail) { toast.error("Please login"); navigate("/signin"); setIsSubmitting(false); return; }
        if (!crop?.farmerEmail) { toast.error("Farmer info missing"); setIsSubmitting(false); return; }

        // compute quantityInKg and numericPrice (reuse your calculations)
        const unit = (crop.unit || "kg").toLowerCase();
        const conversionFactor = unitConversionToKg[unit] || 1;
        const quantityInKg = (quantities[crop.id] || 1) * conversionFactor;

        let numericPrice = 0;
        if (crop.price && crop.price > 0) numericPrice = crop.price;
        else if (crop.priceRange) {
            const parts = crop.priceRange.split('-').map(p => parseFloat(p));
            numericPrice = parts.length === 2 ? (parts[0] + parts[1]) / 2 : parseFloat(crop.priceRange);
        }

        const orderPayload = {
            cropId: crop.id,
            farmerEmail: crop.farmerEmail,
            buyerEmail: buyerEmail,
            quantity: quantityInKg,
            totalPrice: Number((numericPrice * quantityInKg).toFixed(2)),
            deliveryAddress,
            deliveryDate,
            paymentMethod // 'cash_on_delivery' or 'online_payment'
        };

        try {
            if (paymentMethod === "online_payment") {
            // create razorpay order at backend
            let rpOrder;
            try {
                const createRes = await apiClient.post(`/api/payments/create-order`, { amount: orderPayload.totalPrice });
                rpOrder = createRes.data;
            } catch (err) {
                throw new Error(err.response?.data || "Failed to init payment");
            }

            // open Razorpay
            const options = {
                key: rpOrder.key,
                amount: rpOrder.amount,
                currency: rpOrder.currency,
                order_id: rpOrder.orderId,
                name: "KrishiMitra",
                description: `Payment for ${crop.cropName}`,
                handler: async function (resp) {
                try {
                    // verify with backend
                    await apiClient.post(`/api/payments/verify`, {
                        razorpayOrderId: resp.razorpay_order_id,
                        razorpayPaymentId: resp.razorpay_payment_id,
                        razorpaySignature: resp.razorpay_signature,
                        bookingId: null // optional, or send some temp id if you use booking
                    });

                    // payment ok -> create DB order
                    await apiClient.post(`/api/orders`, { ...orderPayload, paymentMethod: "online_payment" });
                    toast.success("Order placed!");
                    navigate("/buyer/orders");
                } catch (err) {
                    toast.error(err.response?.data || "Payment verification failed");
                }
                },
                prefill: { email: buyerEmail }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();

            } else { // cash_on_delivery
            // create DB order immediately with status PENDING. Backend must not require payment verification for COD
            try {
                await apiClient.post(`/api/orders`, orderPayload);
                toast.success("Order placed (COD). Farmer will confirm shortly.");
                navigate("/buyer/orders");
            } catch (err) {
                throw new Error(err.response?.data || "Order creation failed");
            }
            }
        } catch (err) {
            console.error("Error placing order:", err);
            toast.error(err.message || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-green-50">
                <div>Loading crop details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-green-50">
                <div className="p-6 bg-white shadow rounded text-center">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <button 
                        onClick={() => navigate('/BuyerHomePage')} 
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-50">
            <header className="bg-white shadow px-6 py-4">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-green-700 font-bold text-xl flex items-center hover:opacity-80"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back
                    </button>
                    <div className="text-green-700 font-bold text-2xl flex items-center">
                        <FontAwesomeIcon icon={faLeaf} className="mr-2 text-green-600" />
                        KrishiMitra
                    </div>
                    <div className="w-8"></div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Purchase</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        {crops.map(crop => (
                            <div key={crop.id} className="bg-white p-4 rounded shadow mb-4">
                                <div className="flex items-start mb-4">
                                    <img
                                        src={
                                            crop.cropImageUrl
                                                ? `${import.meta.env.VITE_API_URL}${crop.cropImageUrl}`
                                                : crop.imageData
                                                    ? `data:image/jpeg;base64,${crop.imageData}`
                                                    : undefined
                                        }
                                        alt={crop.cropName}
                                        className="w-24 h-24 rounded object-cover mr-4"
                                    />
                                    <div>
                                        <h3 className="font-bold">{crop.cropName}</h3>
                                        <p className="text-sm text-gray-600">Sold by: {crop.farmerName || "Unknown Farmer"}</p>
                                        <p className="text-sm text-gray-600">Location: {crop.address}</p>
                                        {(!crop.price || crop.price <= 0) && !crop.priceRange ? (
                                            '⚠ Price not available'
                                        ) : (
                                            `Price per ${crop.unit}: ₹${
                                                crop.price > 0
                                                    ? crop.price
                                                    : (() => {
                                                        const parts = crop.priceRange?.split('-').map(p => parseFloat(p));
                                                        return parts && parts.length === 2
                                                            ? ((parts[0] + parts[1]) / 2).toFixed(2)
                                                            : crop.priceRange || 'N/A';
                                                    })()
                                            }`
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-gray-700 flex items-center">
                                    <label htmlFor={`qty-${crop.id}`} className="mr-2 font-semibold">Quantity:</label>
                                    <input
                                        type="number"
                                        id={`qty-${crop.id}`}
                                        min="1"
                                        max={crop.availableQuantity}
                                        value={quantities[crop.id] || 1}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value);

                                            if (!val || val < 1) {
                                                val = 1;
                                            }

                                            // Absolutely prevent exceeding available quantity
                                            if (val > crop.availableQuantity) {
                                                toast.error(`Only ${crop.availableQuantity} ${crop.unit} available`);
                                                val = crop.availableQuantity;
                                            }

                                            setQuantities(prev => ({ ...prev, [crop.id]: val }));
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 w-20"
                                        required
                                    />

                                    <span className="ml-2">{crop.unit}</span>
                                </div>

                                <p className="text-xs text-green-600 mt-1 ml-1">
                                    Please confirm your quantity. Maximum available: {crop.availableQuantity} {crop.unit}.
                                </p>
                            </div>
                        ))}

                        <div className="mt-6 text-right text-lg font-semibold">
                            Total: ₹{calculateTotal()}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="address">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                Delivery Address
                            </label>
                            <textarea
                                id="address"
                                className="w-full border p-2 rounded"
                                rows="3"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                required
                                placeholder="Enter your complete delivery address"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="date">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                Delivery Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                className="w-full border p-2 rounded"
                                value={deliveryDate}
                                onChange={(e) => {
                                    const selectedDate = new Date(e.target.value);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    
                                    if (selectedDate >= today) {
                                        setDeliveryDate(e.target.value);
                                    } else {
                                        toast.error('Delivery date must be today or in the future');
                                    }
                                }}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                                Payment Method
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === 'cash_on_delivery'}
                                        onChange={() => setPaymentMethod('cash_on_delivery')}
                                        className="mr-2"
                                        required
                                    />
                                    Cash on Delivery
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online_payment"
                                        checked={paymentMethod === "online_payment"}
                                        onChange={() => setPaymentMethod("online_payment")}
                                        className="mr-2"
                                    />
                                    Online Payment (Coming Soon)
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3 px-4 rounded-md font-medium transition duration-200`}
                        >
                            {isSubmitting ? 'Placing Order...' : `Place Order (₹${calculateTotal()})`}
                        </button>
                    </div>
                </form>
            </main>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default BuyNowPage;