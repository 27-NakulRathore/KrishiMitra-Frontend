import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faEdit,
  faMapMarkerAlt,
  faPhone,
  faBirthdayCake,
  faIdCard,
  faBriefcase,
  faSeedling,
  faLandmark,
  faUniversity,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';

// Import your local background image
import farmerBackground from '../../assets/farmerProfileBg.png';

function FarmerProfile() {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      fetch(`http://localhost:8080/api/farmer/${email}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch farmer: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setFarmer(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load farmer", err);
          setLoading(false);
        });
    } else {
      console.warn("No email found in localStorage");
      setLoading(false);
    }
  }, []);

  const handleEditProfile = () => {
    navigate('/edit-profile/farmer');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-end p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-green-50 to-amber-50 transition-all duration-500">
        {/* Background Image with Less Transparency */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-500"
          style={{
            backgroundImage: `url(${farmerBackground})`,
            opacity: '0.4',
            filter: 'brightness(1.1)'
          }}
        ></div>
        
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 z-10">
          <div className="px-6 py-8">
            <div className="text-center">
              <FontAwesomeIcon icon={faUserCircle} size="5x" className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
              <p className="text-gray-600 mt-2">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-end p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-green-50 to-amber-50 transition-all duration-500">
      {/* Background Image with Less Transparency */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-500"
        style={{
          backgroundImage: `url(${farmerBackground})`,
          opacity: '0.8',
          filter: 'brightness(1.1)'
        }}
      ></div>
      
      {/* Main Profile Card - Positioned at Right Corner */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 z-10 mr-0 md:mr-30">
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <FontAwesomeIcon icon={faUserCircle} size="5x" className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUserCircle} className="mr-3 text-gray-700 w-5" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Name:</label>
                <p className="text-gray-900">{farmer?.name || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faIdCard} className="mr-3 text-gray-700 w-5" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Email:</label>
                <p className="text-gray-900">{farmer?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faPhone} className="mr-3 text-gray-700 w-5" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone:</label>
                <p className="text-gray-900">{farmer?.contactNumber || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-gray-700 w-5" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Address:</label>
                <p className="text-gray-900">
                  {farmer?.address || farmer?.location || 'N/A'}
                </p>
              </div>
            </div>
            
            {farmer?.dob && (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faBirthdayCake} className="mr-3 text-gray-700 w-5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth:</label>
                  <p className="text-gray-900">{farmer.dob}</p>
                </div>
              </div>
            )}
            
            {farmer?.occupation && (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faBriefcase} className="mr-3 text-gray-700 w-5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation:</label>
                  <p className="text-gray-900">{farmer.occupation}</p>
                </div>
              </div>
            )}
            
            {/* Crops Section */}
            {farmer?.crops && farmer.crops.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faSeedling} className="mr-3 text-gray-700 w-5" />
                  <label className="block text-sm font-medium text-gray-700">Crops:</label>
                </div>
                <div className="grid grid-cols-2 gap-2 ml-8">
                  {farmer.crops.map((crop, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bank Details Section */}
            <div className="pt-2">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FontAwesomeIcon icon={faLandmark} className="mr-2 text-green-600" />
                Bank Details
              </h3>
              
              {farmer?.bankDetails ? (
                <div className="space-y-3 ml-7">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faUniversity} className="mr-3 text-gray-700 w-4" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Name:</label>
                      <p className="text-gray-900">{farmer.bankDetails.bankName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-3 text-gray-700 w-4" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number:</label>
                      <p className="text-gray-900">{farmer.bankDetails.accountNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faUserCircle} className="mr-3 text-gray-700 w-4" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Holder:</label>
                      <p className="text-gray-900">{farmer.bankDetails.accountHolderName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faIdCard} className="mr-3 text-gray-700 w-4" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IFSC Code:</label>
                      <p className="text-gray-900">{farmer.bankDetails.ifscCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm ml-7">No bank details added yet.</p>
              )}
            </div>
            
            <div className="pt-6 flex space-x-3">
              <button
                onClick={handleEditProfile}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-green-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Profile
              </button>
              <Link
                to="/FarmerHomePage"
                className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerProfile;