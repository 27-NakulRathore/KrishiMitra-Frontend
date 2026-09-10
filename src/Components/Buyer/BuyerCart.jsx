import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from "react-toastify";
import {
    faShoppingCart,
    faTrashAlt,
    faArrowLeft,
    faCreditCard,
    faLeaf,
    faMessage
} from '@fortawesome/free-solid-svg-icons';

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [cartTotal, setCartTotal] = useState(0);

    useEffect(() => {
        const fetchCartWithCropDetails = async () => {
            const email = localStorage.getItem('email');
            const rawCart = JSON.parse(localStorage.getItem(`cart-${email}`)) || [];

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/crops/all`);
                const cropsFromServer = await response.json();

                const mergedCart = rawCart.map(cartItem => {
                    const crop = cropsFromServer.find(c => c.id === cartItem.id);
                    if (crop) {
                        return {
                            ...cartItem,
                            cropName: crop.cropName,
                            price: parseFloat(crop.pricePerKg) || 0,
                            unit: crop.unit || 'kg',
                            cropImageUrl: crop.cropImageUrl || null,
                            imageData: crop.imageData || null,
                            farmer: {
                                name: crop.farmerName || 'Unknown Farmer',
                                email: crop.farmerEmail || null
                            },
                            cartQuantity: cartItem.cartQuantity || 1,
                            availableQuantity: crop.quantity || 0
                        };
                    } else {
                        return {
                            ...cartItem,
                            cropName: cartItem.cropName || 'Unknown',
                            price: 0,
                            unit: 'kg',
                            farmer: { name: 'Unknown Farmer' }
                        };
                    }
                });

                setCartItems(mergedCart);
            } catch (err) {
                console.error("Failed to fetch crops from server:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCartWithCropDetails();
    }, []);

    const handleQuantityChange = (cropId, value) => {
        let qty = parseInt(value, 10);
        if (isNaN(qty) || qty < 1) qty = 1;

        const cropItem = cartItems.find(item => item.id === cropId);
        if (!cropItem) return;

        const maxQty = cropItem.availableQuantity || Infinity;

        if (qty > maxQty) {
            toast.error(`Only ${maxQty} ${cropItem.unit} available`);
            qty = maxQty;
        }

        updateQuantity(cropId, qty);
    };


    const updateCart = (updatedCart) => {
        const email = localStorage.getItem('email');
        localStorage.setItem(`cart-${email}`, JSON.stringify(updatedCart));
        setCartItems(updatedCart);
    };

    const removeItem = (itemId) => {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        updateCart(updatedCart);
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedCart = cartItems.map(item =>
            item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
        );
        updateCart(updatedCart);
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const quantity = item.cartQuantity || 1;

            let price = item.price;
            if (!price && item.priceRange) {
                price = item.priceRange;
            }

            let numericPrice = 0;
            if (typeof price === 'string') {
                const parts = price.split('-').map(p => parseFloat(p));
                if (parts.length === 2) {
                    numericPrice = (parts[0] + parts[1]) / 2;
                } else {
                    numericPrice = parseFloat(price);
                }
            } else {
                numericPrice = price || 0;
            }

            return sum + numericPrice * quantity;
        }, 0);
    };

    const handleCheckout = () => {
        const total = calculateTotal();
        navigate('/buyer/checkout', { 
            state: { 
                cartItems: cartItems,
                total: total,
                fromCart: true
            } 
        });
    };

    const handleMessageFarmer = (farmer, crop) => {
        navigate('/buyer/chat', {
            state: {
                farmer: farmer,
                crop: crop
            }
        });
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="mr-4 text-gray-600 hover:text-gray-800"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faShoppingCart} className="mr-3 text-green-600" />
                        Your Shopping Cart
                    </h1>
                    <span className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <FontAwesomeIcon 
                            icon={faShoppingCart} 
                            className="text-gray-300 text-5xl mb-4" 
                        />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet</p>
                        <Link
                            to="/BuyerHomePage"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
                        >
                            <FontAwesomeIcon icon={faLeaf} className="mr-2" />
                            Browse Crops
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="p-4 flex flex-col sm:flex-row">
                                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                                                {item.imageData && (
                                                    <img
                                                        src={`data:image/jpeg;base64,${item.imageData}`}
                                                        alt={item.cropName}
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                )}

                                                {!item.imageData && item.cropImageUrl && (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}${item.cropImageUrl}`}
                                                        alt={item.cropName}
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                )}

                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-medium text-gray-800">{item.cropName}</h3>
                                                    <div className="flex space-x-4">
                                                        <button 
                                                            onClick={() => handleMessageFarmer(item.farmer, item)}
                                                            className="text-gray-400 hover:text-blue-500"
                                                            title="Message farmer"
                                                        >
                                                            <FontAwesomeIcon icon={faMessage} />
                                                        </button>
                                                        <button 
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-gray-400 hover:text-red-500"
                                                            title="Remove item"
                                                        >
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">Sold by: {item.farmer?.name || 'Local Farmer'}</p>
                                                <p className="text-green-600 font-semibold mb-3">
                                                    ₹{item.price || item.priceRange || 'N/A'}/{item.unit || 'kg'}
                                                </p>
                                                <div className="flex items-center">
                                                    <label className="text-sm text-gray-600 mr-3" htmlFor={`qty-${item.id}`}>Quantity:</label>
                                                    <input
                                                        type="number"
                                                        id={`qty-${item.id}`}
                                                        min="1"
                                                        max={item.availableQuantity}
                                                        value={item.cartQuantity}
                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1 w-20"
                                                    />
                                                    <span className="ml-2 text-gray-500 text-sm">{item.unit || 'kg'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">₹0.00</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-3">
                                        <span className="text-gray-600 font-semibold">Total</span>
                                        <span className="text-green-600 font-bold">₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;
