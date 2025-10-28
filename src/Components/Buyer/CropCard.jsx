import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faTrashAlt,
    faArrowLeft,
    faCreditCard,
    faLeaf
} from '@fortawesome/free-solid-svg-icons';

const ROUTES = {
  HOME: "/BuyerHomePage",
  CART: '/buyer/cart',
  CHECKOUT: '/buyer/checkout',
};

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem("email");  // Get the logged-in user's email
        const cart = JSON.parse(localStorage.getItem(`cart-${email}`)) || [];  // Load the cart for that email
        setCartItems(cart);
        setLoading(false);
    }, []);

    const updateCart = (updatedCart) => {
    const email = localStorage.getItem("email");  // Ensure this is the current email
    localStorage.setItem(`cart-${email}`, JSON.stringify(updatedCart));  // Save cart under the email key
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
        return cartItems.reduce(
            (total, item) => total + (item.price * item.cartQuantity), 0
        ).toFixed(2);
    };

    const handleCheckout = () => {
        navigate('/buyer/checkout');
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
                            to={ROUTES.HOME}
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
                                                <img
                                                    src={`data:image/jpeg;base64,${item.cropImage}`}
                                                    alt={item.cropName}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-medium text-gray-800">{item.cropName}</h3>
                                                    <button 
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">Sold by: {item.farmer?.name || 'Local Farmer'}</p>
                                                <p className="text-green-600 font-semibold mb-3">
                                                    ₹{item.price}/{item.unit}
                                                </p>
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-600 mr-3">Quantity:</span>
                                                    <div className="flex items-center border border-gray-300 rounded">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                            disabled={item.cartQuantity <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-3 py-1 text-center min-w-[30px]">
                                                            {item.cartQuantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
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
                                        <span className="font-medium">₹{calculateTotal()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">₹0.00</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-3">
                                        <span className="text-gray-600 font-semibold">Total</span>
                                        <span className="text-green-600 font-bold">₹{calculateTotal()}</span>
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