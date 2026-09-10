import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLocationDot,
  faPhoneAlt,
  faLeaf,
  faTractor,
  faSignOutAlt,
  faUserCircle,
  
  faArrowRight,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import PropTypes from 'prop-types';
import cropRecommendationImg from '../../assets/croprecom.png';
import organicFarmingImg from '../../assets/organic.png';
import diseasePredictionImg from '../../assets/disease.png';
import farmerShopImg from '../../assets/shop.png';
import cropprice from '../../assets/cropprice.png'
import apiClient from '../../api/client';

function FarmerHomePage() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const email = localStorage.getItem("email") || 'Farmer';
  const [farmer, setFarmer] = useState(null);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "farmer") {
        navigate("/signin", { replace: true });
    }
}, []);


  useEffect(() => {
    const emailStored = localStorage.getItem("email");
    if (emailStored) {
      apiClient.get(`/api/farmer/${emailStored}`)
        .then(res => res.data)
        .then(data => {
          setFarmer(data);

          // Fetch weather based on farmers location
          if (data?.location) {
            const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
            fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${data.location}&appid=${apiKey}&units=metric`
            )
              .then(res => res.json())
              .then(weatherData => {
                if (weatherData?.main) {
                  setWeather({
                    temp: Math.round(weatherData.main.temp),
                    condition: weatherData.weather[0].main,
                    icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`
                  });
                }
              })
              .catch(err => console.error("Weather fetch error:", err));
          }

          // Fetch notifications for the farmer
          fetchNotifications(data.id || emailStored);

        })
        .catch(err => console.error("Failed to load farmer", err));
    }
  }, []);

  const fetchNotifications = async () => {
  try {
    const res = await apiClient.get(`/api/notifications/farmer/${email}`);
    const data = res.data;

    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  } catch (err) {
    console.error("Failed to load notifications", err);
  }
};


  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    // Mark notifications as read when opening
    if (!isNotificationOpen && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setIsNotificationOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLogout = () => {
    const emailStored = localStorage.getItem("email");
    if (emailStored) {
      localStorage.removeItem(`cart-${emailStored}`);
      localStorage.removeItem("email");
    }
    navigate("/signin", { replace: true });
  };

  const handleNotificationClick = async (notification) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notification.id}/read`, {
      method: "PATCH"
    });

    navigate("/farmer/orders");
    setIsNotificationOpen(false);
  };


  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  // Card data matching the image style
  const featureCards = [
    {
      title: "Farmer Shop",
      description: "Manage your crops - upload listings, view sales, and track bookings all in one place.",
      image: farmerShopImg,
      features: ["Upload Crops", "View Listings", "Track Sales", "Manage Bookings"],
      action: () => navigate('/farmer/shop', { state: { email: email } })
    },
    {
      title: "Crop Recommendation",
      description: "Find the best crop to cultivate based on your soil and weather conditions using advanced AI algorithms.",
      image: cropRecommendationImg,
      features: ["AI Powered", "Soil Analysis", "Weather Based", "Optimal Crops", "Seasonal Advice"],
      action: () => navigate('/crop-recommendation')
    },
   
    {
      title: "Disease Prediction",
      description: "Detect plant diseases early and get preventive measures and treatment advice to protect your crops.",
      image: diseasePredictionImg,
      features: ["Early Detection", "Treatment", "Prevention", "Plant Health"],
      action: () => navigate('/disease-prediction')
    },
    {
      title: "Crop Price Tracker",
      description: "Monitor and analyze crop prices in real-time to make informed selling decisions.",
      image: cropprice,
      features: ["Real-time Data", "Price Alerts", "Market Trends", "Historical Data"],
      action: () => navigate('/crop-price-tracker')
    },
    {
      title: "Organic Farming Guide",
      description: "Learn sustainable organic practices—from soil preparation to eco-friendly pest control and certification processes.",
      image: organicFarmingImg,
      features: ["Sustainable", "Eco-friendly", "Certification", "Soil Health"],
      action: () => navigate('/farmer/organic-guide')
    },
    
  ];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faLeaf}
              size="2xl"
              className="text-green-600 mr-3"
            />
            <span className="text-2xl font-bold text-green-700">Krishiमित्र</span>
          </div>
        </div>

        {/* Weather Section */}
        {weather && (
          <div className="flex items-center bg-green-100 px-3 py-1 rounded-full shadow-sm">
            <img src={weather.icon} alt="weather" className="w-6 h-6 mr-2" />
            <span className="text-green-700 font-medium">
              {weather.temp}°C | {weather.condition}
            </span>
          </div>
        )}

        <div className="flex flex-col items-end">
          <div className="flex items-center text-green-700 font-semibold text-lg">
            <FontAwesomeIcon icon={faTractor} size="lg" className="mr-2" />
            Welcome, Farmer!
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Logged in as: <span className="font-medium">{email}</span>
          </div>
        </div>

        {/* Profile Dropdown & Notifications */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 text-gray-600 hover:text-green-700 transition-colors"
            >
              <FontAwesomeIcon icon={faBell} size="lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 overflow-hidden">
                <div className="px-4 py-3 border-b bg-green-50">
                  <h3 className="font-semibold text-green-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            notification.type === 'order'
                              ? 'bg-green-100 text-green-800'
                              : notification.type === 'update'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t bg-gray-50">
                  <Link
                    to="/farmer/notifications"
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="flex items-center">
              <FontAwesomeIcon icon={faUserCircle} size="lg" className="text-gray-600 hover:text-gray-800" />
              <span className="ml-2 hidden md:inline">{farmer?.name || 'Farmer'}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md z-50 overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <p className="font-medium">{farmer?.name || 'User'}</p>
                  <p className="text-sm text-gray-600 truncate">{farmer?.email || ''}</p>
                </div>
                <Link to="/farmer/profile" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                  My Profile
                </Link>
                <Link to="/farmer/bookings" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                  <FontAwesomeIcon icon={faBell} className="mr-2" />
                  Orders & Notifications
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t">
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Comprehensive Agricultural Solutions</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our cutting-edge tools designed to revolutionize your farming experience with AI-powered insights and community collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featureCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-2/5">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Section */}
                <div className="p-6 md:w-3/5 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h2>
                  <p className="text-gray-600 mb-4">{card.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {card.features.map((feature, i) => (
                      <span
                        key={i}
                        className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto flex justify-end">
                    <button
                      onClick={card.action}
                      className="flex items-center text-green-600 hover:text-green-800 font-semibold"
                    >
                      Explore
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faLeaf} size="lg" className="text-green-300 mr-2" />
                <span className="text-xl font-bold text-green-100">CropBoom</span>
              </div>
              <p className="text-green-200">
                Empowering farmers with AI-driven insights, tools, and marketplace opportunities for a better harvest.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
              </div>
            </div>

            {/* Farmer Tools / Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-100">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/farmer/shop" className="text-green-300 hover:text-white transition-colors">Farmer Shop</Link></li>
                <li><Link to="/farmer/crop-listings" className="text-green-300 hover:text-white transition-colors">My Crops</Link></li>
                <li><Link to="/crop-recommendation" className="text-green-300 hover:text-white transition-colors">Crop Recommendation</Link></li>
                <li><Link to="/yield-prediction" className="text-green-300 hover:text-white transition-colors">Yield Prediction</Link></li>
                <li><Link to="/disease-prediction" className="text-green-300 hover:text-white transition-colors">Disease Prediction</Link></li>
              </ul>
            </div>

            {/* Support & Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-100">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-green-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/weather" className="text-green-300 hover:text-white transition-colors">Weather Info</Link></li>
                <li><Link to="/community" className="text-green-300 hover:text-white transition-colors">Community Forum</Link></li>
                <li><Link to="/tutorials" className="text-green-300 hover:text-white transition-colors">Tutorials</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-100">Contact Support</h3>
              <address className="not-italic space-y-2 text-green-300">
                <p className="flex items-start">
                  <FontAwesomeIcon icon={faLocationDot} className="mt-1 mr-2" />
                  <span>AgriTech Hub, Farmer City, IN 452001</span>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                  <a href="tel:+918888888888">+91 88888 88888</a>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  <a href="mailto:support@cropboom.com">support@cropboom.com</a>
                </p>
              </address>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-300">
            <p>&copy; {new Date().getFullYear()} CropBoom. Empowering Farmers for Tomorrow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

FarmerHomePage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      email: PropTypes.string
    })
  })
};

export default FarmerHomePage;
