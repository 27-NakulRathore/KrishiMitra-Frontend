import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faTractor,
  faSignOutAlt,
  faUserCircle,
  faBoxOpen,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

// Import placeholder images (you should replace these with your actual images)
import cropRecommendationImg from '../../assets/croprecom.png';
import yieldPredictionImg from '../../assets/yield.png';
import organicFarmingImg from '../../assets/organic.png';
import diseasePredictionImg from '../../assets/disease.png';
import aiChatbotImg from '../../assets/chat.png';
import farmerShopImg from '../../assets/shop.png';

function FarmerHomePage() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const email = localStorage.getItem("email") || 'Farmer';
  const [farmer, setFarmer] = useState(null);
    
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
        fetch(`http://localhost:8080/api/farmer/${email}`)
            .then(res => res.json())
            .then(data => setFarmer(data))
            .catch(err => console.error("Failed to load farmer", err));
    }
  }, []);

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

  const handleLogout = () => {
    const email = localStorage.getItem("email");
    if (email) {
        localStorage.removeItem(`cart-${email}`);
        localStorage.removeItem("email");
    }
    navigate("/signin");
  };

  // Card data matching the image style
  const featureCards = [
     {
      title: "Farmer Shop",
      description: "Manage your crops - upload listings, view sales, and track bookings all in one place.",
      image: farmerShopImg,
      features: ["Upload Crops", "View Listings", "Track Sales", "Manage Bookings"],
action: () => navigate('/farmer/upload-crop', { state: { email: email } })
    },
    {
      title: "Crop Recommendation",
      description: "Find the best crop to cultivate based on your soil and weather conditions using advanced AI algorithms.",
      image: cropRecommendationImg,
      features: ["AI Powered", "Soil Analysis", "Weather Based", "Optimal Crops", "Seasonal Advice"],
      action: () => navigate('/crop-recommendation')
    },
    {
      title: "Yield Prediction",
      description: "Predict the expected yield for different crops using advanced machine learning models and historical data.",
      image: yieldPredictionImg,
      features: ["ML Analytics", "Historical Data", "Accurate Forecast", "Early Detection"],
      action: () => navigate('/yield-prediction')
    },
    {
      title: "Organic Farming Guide",
      description: "Learn sustainable organic practices—from soil preparation to eco-friendly pest control and certification processes.",
      image: organicFarmingImg,
      features: ["Sustainable", "Eco-friendly", "Certification", "Soil Health"],
      action: () => navigate('/organic-guide')
    },
    
    {
      title: "Disease Prediction",
      description: "Detect plant diseases early and get preventive measures and treatment advice to protect your crops.",
      image: diseasePredictionImg,
      features: ["Early Detection", "Treatment", "Prevention", "Plant Health"],
      action: () => navigate('/disease-prediction')
    },
   
    {
      title: "AI ChatBot",
      description: "Get instant plantation guidance and crop planning assistance from our AI assistant.",
      image: aiChatbotImg,
      features: ["24/7 Support", "Plantation Guide", "Crop Planning", "Instant Help"],
      action: () => navigate('/ai-chatbot')
    },
   
  ];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <Link to="/" className="text-green-700 font-bold text-2xl flex items-center hover:opacity-80">
          <FontAwesomeIcon icon={faLeaf} className="mr-2 text-green-600 animate-pulse" />
          CropBoom
        </Link>

        <div className="flex flex-col items-end">
          <div className="flex items-center text-green-700 font-semibold text-lg">
            <FontAwesomeIcon icon={faTractor} size="lg" className="mr-2" />
            Welcome, Farmer!
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Logged in as: <span className="font-medium">{email}</span>
          </div>
        </div>

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
              <Link to="/farmer/products" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
                My Crops
              </Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Logout
              </button>
            </div>
          )}
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

      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm mt-8">
        &copy; {new Date().getFullYear()} CropBoom. All rights reserved.
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