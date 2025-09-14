import React, { useState } from 'react';
import '../../index.css';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faTractor, faEye, faEyeSlash, faArrowLeft, faUser, faEnvelope, faLock, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import backgroundimage from '../../assets/farmerregistration.png';

function FarmerRegistrationForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        location: '',
        contactNumber: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        location: '',
        contactNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validateName = (name) => {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        if (!name.trim()) return 'Name is required';
        if (!nameRegex.test(name)) return 'Name should be 2-50 alphabetic characters';
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

    const validateLocation = (location) => {
        if (!location.trim()) return 'Location is required';
        if (location.trim().length < 5) return 'Location should be at least 5 characters';
        if (!/[a-zA-Z]/.test(location)) return 'Location should contain letters';
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
            location: validateLocation(formData.location),
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
            const response = await fetch('http://localhost:8080/api/register/farmer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    location: formData.location,
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
                console.error('Failed to register farmer:', errorData);
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
        <div className="min-h-screen flex justify-center items-center p-4 md:p-10 relative"
            style={{
                backgroundImage: `url(${backgroundimage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-md w-full animate-fade-in">
                <div className="flex items-center mb-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-green-600 hover:text-green-800 mr-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                    <div className="text-center flex-grow">
                        <FontAwesomeIcon icon={faLeaf} size="2x" className="text-green-600 mb-2 animate-pulse shadow-md rounded-full bg-white p-2" />
                        <h1 className="text-2xl font-bold text-green-700">Krishiमित्र</h1>
                        <div className="flex items-center justify-center mt-2">
                            <FontAwesomeIcon icon={faTractor} size="lg" className="text-green-600 mr-2" />
                            <h2 className="text-xl font-bold text-gray-800">Farmer Registration</h2>
                        </div>
                    </div>
                    <div className="w-8"></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Name */}
                    <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                        <input
                            className={`pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                        <input
                            className={`pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                        <input
                            className={`pl-10 pr-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? 'Hide Password' : 'Show Password'}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size="lg" />
                        </button>
                        {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
                    </div>

                    {/* Location */}
                    <div className="relative">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                        <input
                            className={`pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.location ? 'border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                            id="location"
                            name="location"
                            type="text"
                            placeholder="Farm Location (City, State)"
                            value={formData.location}
                            onChange={handleChange}
                        />
                        {errors.location && <p className="text-red-500 text-xs italic mt-1">{errors.location}</p>}
                    </div>

                    {/* Contact Number */}
                    <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                        <input
                            className={`pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.contactNumber ? 'border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                            id="contactNumber"
                            name="contactNumber"
                            type="tel"
                            placeholder="10-digit number"
                            value={formData.contactNumber}
                            onChange={handleChange}
                        />
                        {errors.contactNumber && <p className="text-red-500 text-xs italic mt-1">{errors.contactNumber}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                    
                    <div className="text-center mt-3">
                        <Link to="/signin" className="inline-block align-baseline font-bold text-xs text-green-500 hover:text-green-800">
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

export default FarmerRegistrationForm;
