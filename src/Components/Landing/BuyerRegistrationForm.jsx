import React, { useState } from 'react';
import '../../index.css';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faLeaf, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BuyerRegistrationForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shippingAddress: '',
        contactNumber: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        shippingAddress: '',
        contactNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validateName = (name) => {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        if (!name.trim()) return 'Name is required';
        if (!nameRegex.test(name)) return 'Name should be 2-50 alphabetic characters';
        if (name.trim().length < 2) return 'Name should be at least 2 characters';
        return '';
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
        return '';
    };

    const validateShippingAddress = (address) => {
        if (!address.trim()) return 'Shipping address is required';
        if (address.trim().length < 10) return 'Address should be at least 10 characters';
        if (!/[a-zA-Z]/.test(address) || !/[0-9]/.test(address)) return 'Address should contain both letters and numbers';
        return '';
    };

    const validateContactNumber = (number) => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!number.trim()) return 'Contact number is required';
        if (!phoneRegex.test(number)) return 'Please enter a valid 10-digit number';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            shippingAddress: validateShippingAddress(formData.shippingAddress),
            contactNumber: validateContactNumber(formData.contactNumber)
        };
        
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors in the form', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch('http://localhost:8080/api/register/buyer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    address: formData.shippingAddress,
                    contactNumber: formData.contactNumber,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);
                toast.success('Successfully registered! Redirecting to login...', {
                    position: "top-right",
                    autoClose: 3000,
                });
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            } else {
                const errorData = await response.json();
                console.error('Failed to register buyer:', errorData);
                toast.error(errorData.message || 'Registration failed. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Network error. Please try again.', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-50 flex justify-center items-center p-4 md:p-10">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-md w-full animate-fade-in">
                {/* Header with back arrow */}
                <div className="flex items-center mb-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                    <div className="text-center flex-grow">
                        <FontAwesomeIcon icon={faLeaf} size="2x" className="text-green-600 mb-2 animate-pulse shadow-md rounded-full bg-white p-2" />
                        <h1 className="text-2xl font-bold text-green-700">Krishiमित्र</h1>
                        <div className="flex items-center justify-center mt-2">
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" className="text-blue-500 mr-2" />
                            <h2 className="text-xl font-bold text-gray-800">Buyer Registration</h2>
                        </div>
                    </div>
                    <div className="w-8"></div> {/* Spacer for alignment */}
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <div className="flex items-center">
                            <label className="block text-gray-700 text-sm font-bold w-1/3 text-right mr-3" htmlFor="name">
                                Name:
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Your Full Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs italic text-right pr-3 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <div className="flex items-center">
                            <label className="block text-gray-700 text-sm font-bold w-1/3 text-right mr-3" htmlFor="email">
                                Email:
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs italic text-right pr-3 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <div className="flex items-center relative">
                            <label className="block text-gray-700 text-sm font-bold w-1/3 text-right mr-3" htmlFor="password">
                                Password:
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide Password' : 'Show Password'}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} size="lg" />
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs italic text-right pr-3 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <div className="flex items-center">
                            <label className="block text-gray-700 text-sm font-bold w-1/3 text-right mr-3" htmlFor="shippingAddress">
                                Shipping Address:
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.shippingAddress ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                id="shippingAddress"
                                name="shippingAddress"
                                type="text"
                                placeholder="Street, City, Postal Code"
                                value={formData.shippingAddress}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.shippingAddress && <p className="text-red-500 text-xs italic text-right pr-3 mt-1">{errors.shippingAddress}</p>}
                    </div>

                    <div>
                        <div className="flex items-center">
                            <label className="block text-gray-700 text-sm font-bold w-1/3 text-right mr-3" htmlFor="contactNumber">
                                Contact No.:
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.contactNumber ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                id="contactNumber"
                                name="contactNumber"
                                type="tel"
                                placeholder="10-digit number"
                                value={formData.contactNumber}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.contactNumber && <p className="text-red-500 text-xs italic text-right pr-3 mt-1">{errors.contactNumber}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                    
                    <div className="text-center mt-3">
                        <Link to="/signin" className="inline-block align-baseline font-bold text-xs text-blue-500 hover:text-blue-800">
                            Already have an account? Sign In
                        </Link>
                    </div>
                </form>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        </div>
    );
}

export default BuyerRegistrationForm;