import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    faLeaf,
    faSignOutAlt,
    faUserCircle,
    faCog,
    faSearch,
    faBoxOpen,
    faMapMarkerAlt,
    faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';

function BuyerProfile() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [crops, setCrops] = useState([]);
    const [error, setError] = useState(null);
    const [buyer, setBuyer] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartCount(cart.reduce((total, item) => total + (item.cartQuantity || 1), 0));
    }, []);

    useEffect(() => {
        const email = localStorage.getItem("email");
        console.log("Email from localStorage[BuyerHomePage]:", email);
        if (email) {
            fetch(`http://localhost:8080/api/buyer/${email}`)
                .then(res => res.json())
                .then(data => {
                    setBuyer(data);
                    console.log("Fetched buyer data:", data);
                })
                .catch(err => console.error("Failed to load buyer", err));
        } else {
            console.warn("No email found in localStorage");
        }
    }, []);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                let response;
                if (searchTerm.trim() === "") {
                    response = await fetch("http://localhost:8080/api/crops/suggestions");
                } else {
                    response = await fetch(`http://localhost:8080/api/crops/search?query=${searchTerm}`);
                }

                if (!response.ok) throw new Error("Failed to fetch crops");
                const data = await response.json();
                setCrops(data);
                console.log("Fetched Crop Data:", data);
            } catch (err) {
                console.error("Error fetching crops:", err);
                setError("Failed to load crops");
            }
        };

        fetchCrops();
    }, [searchTerm]);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // In your logout function
    const handleLogout = () => {
        const email = localStorage.getItem("email");
        if (email) {
            // Remove the previous cart data for the logged-out user
            localStorage.removeItem(`cart-${email}`);
            // Remove the email from localStorage
            localStorage.removeItem("email");
        }
        // Optionally, navigate to the login page or home page
        navigate("/signin");
    };


    const handleAddToCart = (crop) => {
        const email = localStorage.getItem('email');

        if (!email) {
            toast.error("You must be logged in to add items to the cart.", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        const existingCart = JSON.parse(localStorage.getItem(`cart-${email}`)) || [];
        const existingItemIndex = existingCart.findIndex(item => item.id === crop.id);

        if (existingItemIndex >= 0) {
            existingCart[existingItemIndex].cartQuantity += 1;
        } else {
            existingCart.push({ ...crop, cartQuantity: 1 });
        }

        localStorage.setItem(`cart-${email}`, JSON.stringify(existingCart));
        setCartCount(existingCart.reduce((total, item) => total + (item.cartQuantity || 1), 0));

        toast.success(`${crop.cropName} added to cart`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    
    const handleBuyNow = (cropId) => {
        navigate(`/buyer/checkout?cropId=${cropId}`);
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col">
            <header className="bg-white shadow px-6 py-4">
                <div className="flex justify-between items-center">
                <div className="flex items-center">
          <div className="relative">
            <FontAwesomeIcon 
              icon={faLeaf} 
              size="lg" 
              className="text-green-600 mr-2" 
            />
           
          </div>
          <span className="text-xl font-bold text-green-700">Krishiमित्र</span>
        </div>

                    <div className="w-full max-w-md mx-4 relative">
                        <input
                            type="text"
                            placeholder="Search for crops..."
                            className="w-full py-2 px-4 pl-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/buyer/cart" className="text-gray-600 hover:text-gray-800 relative">
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="relative" ref={dropdownRef}>
                            <button onClick={toggleDropdown} className="flex items-center">
                                <FontAwesomeIcon icon={faUserCircle} size="lg" className="text-gray-600 hover:text-gray-800" />
                                <span className="ml-2 hidden md:inline">{buyer?.name || 'Profile'}</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b">
                                        <p className="font-medium">{buyer?.name || 'User'}</p>
                                        <p className="text-sm text-gray-600 truncate">{buyer?.email || ''}</p>
                                    </div>
                                    <Link to="/buyer/profile" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                                        <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                                        My Profile
                                    </Link>
                                    <Link to="/buyer/orders" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                                        <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
                                        Order History
                                    </Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t">
                                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 flex-grow">
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                                <FontAwesomeIcon icon={faUserCircle} size="lg" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Welcome, {buyer?.name || 'Buyer'}</h2>
                                <p className="text-gray-600">Browse and purchase fresh crops directly from farmers</p>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Available Crops</h3>
                        <div className="text-sm text-gray-500">Showing {crops.length} items</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {crops.map((crop) => (
                            <div key={crop.id} className="bg-gray-50 border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={`data:image/jpeg;base64,${crop.cropImage}`} alt={crop.cropName} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                        <h4 className="font-bold text-white">{crop.cropName}</h4>
                                        <p className="text-sm text-white/90">{crop.farmer?.name} • {crop.address}</p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-lg font-bold text-gray-800">
                                            ₹{crop.price ? crop.price : (crop.priceRange || 'N/A')}/{crop.unit || 'kg'}</p>

                                            <p className="text-sm text-gray-600">Available: {crop.quantity} {crop.unit}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        <button onClick={() => handleAddToCart(crop)} className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 text-sm py-2 rounded flex items-center justify-center">
                                            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                                            Add to Cart
                                        </button>
                                        <button onClick={() => handleBuyNow(crop.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded">
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="text-center text-gray-500 py-4 text-sm bg-gray-100">
                © {new Date().getFullYear()} CropBoom. All rights reserved.
            </footer>

            <ToastContainer />
        </div>
    );
}

export default BuyerProfile;
