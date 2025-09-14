import React, { useState, useEffect } from 'react';
import '../../index.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faEye, faEyeSlash, faArrowLeft, faHandshake, faSeedling } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your background image - replace with your actual image path
import backgroundImage from '../../assets/signin.png';

function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('registered') === 'true') {
            toast.success('Successfully registered! Please sign in.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }, [location.search]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // Updated password validation: at least 8 characters, one uppercase, one lowercase, one number, one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password is required.');
            isValid = false;
        } else if (!validatePassword(password)) {
            setPasswordError(
                'Password must be at least 8 characters long and contain uppercase, lowercase, number, and a special character.'
            );
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (isValid) {
            try {
                const response = await fetch('http://localhost:8080/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Login successful. Role:', data.role);
                    console.log('Login successful. Role:', data.email);

                    // ✅ Store email in localStorage
                    localStorage.setItem("email", data.email);
                    console.log("Saved email to localStorage:", localStorage.getItem("email"));
                    localStorage.setItem("role", data.role);
                    console.log("Saved Role to localStorage:", localStorage.getItem("role"));
                    
                    toast.success('Login successful!', {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    setTimeout(() => {
                        if (data.role === 'farmer') {
                            navigate('/FarmerHomePage', { state: { email: data.email } });
                        } else if (data.role === 'buyer') {
                            navigate('/BuyerHomePage', { state: { email: data.email } });
                        } else {
                            navigate('/');
                        }
                        
                    }, 3000);

                } else {
                    const errorText = await response.text();
                    console.error(`Login failed: ${errorText}`);
                    toast.error(`Login failed: ${errorText}`, {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
            } catch (error) {
                console.error('Login error:', error);
                toast.error('An error occurred. Please try again.', {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div 
            className="min-h-screen flex justify-center items-center p-4 md:p-10 relative"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Background overlay with blur and opacity */}
            
            
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-md w-full animate-fade-in z-10">
                {/* Header with back arrow */}
                <div className="flex items-center mb-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-green-600 hover:text-green-800 mr-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                    <div className="text-center flex-grow">
                        <div className="flex items-center justify-center mb-2">
                            <div className="relative">
                                <FontAwesomeIcon 
                                    icon={faLeaf} 
                                    size="2x" 
                                    className="text-green-600 animate-pulse shadow-md rounded-full bg-white p-2" 
                                />
                                
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-green-700">Krishiमित्र</h1>
                        <p className="text-gray-600">It's good to have you back!</p>
                    </div>
                    <div className="w-8"></div> {/* Spacer for alignment */}
                </div>

                {/* Sign In Form */}
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="email"
                        >
                            Email Address
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${emailError ? 'border-red-500' : 'border-green-300 focus:border-green-500'
                                }`}
                            id="email"
                            type="email"
                            placeholder="Email Id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {emailError && (
                            <p className="text-red-500 text-xs italic">{emailError}</p>
                        )}
                    </div>
                    <div>
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${passwordError ? 'border-red-500' : 'border-green-300 focus:border-green-500'
                                    }`}
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                onClick={togglePasswordVisibility}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5" />
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-500 text-xs italic">{passwordError}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
                    >
                        Sign In
                    </button>
                    <div className="text-center mt-4">
                        <span className="text-gray-600">New user? </span>
                        <Link
                            to="/"
                            className="font-bold text-sm text-green-500 hover:text-green-800"
                        >
                            Register here
                        </Link>
                    </div>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default SignInForm;