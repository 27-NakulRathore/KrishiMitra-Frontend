import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudUpload, 
  faListAlt, 
  faShoppingBag, 
  faArrowLeft,
  faLeaf
} from '@fortawesome/free-solid-svg-icons';

// Import images for each section
import uploadCropImg from '../../assets/booking.png';
import myListingsImg from '../../assets/booking.png';
import bookingsImg from '../../assets/booking.png';

function FarmerShop() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const handleBackClick = () => {
    navigate('/FarmerHomePage');
  };

  const shopSections = [
    {
      title: "Upload Crop",
      description: "List your harvested crops for sale with AI-powered quality analysis.",
      image: uploadCropImg,
      icon: faCloudUpload,
      color: "bg-green-500",
      action: () => navigate('/farmer/upload-crop', { state: { email } })
    },
    {
      title: "My Listings",
      description: "View and manage your listed crops, update details, or mark as sold.",
      image: myListingsImg,
      icon: faListAlt,
      color: "bg-blue-500",
      action: () => navigate(`/farmer/crop-listings?email=${encodeURIComponent(email)}`)
    },
    {
      title: "Bookings & Sales",
      description: "Track your sales, manage buyer bookings, and confirm deliveries.",
      image: bookingsImg,
      icon: faShoppingBag,
      color: "bg-purple-500",
      action: () => navigate('/farmer/bookings', { state: { email } })
    }
  ];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faLeaf} className="mr-2 text-green-600" />
          <span className="text-xl font-bold text-green-700">CropBoom - Farmer Shop</span>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center text-green-700 font-semibold">
            <span className="mr-2">Welcome,</span>
            <span className="font-medium">{email || 'Farmer'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 flex-grow">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center text-green-600 hover:text-green-800 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Home
        </button>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Farmer Shop</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Manage your farming business with our comprehensive tools for crop sales, listings, and order management.
          </p>
        </div>

        {/* Shop Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shopSections.map((section, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={section.action}
            >
              {/* Image Section */}
              <div className="h-48 overflow-hidden">
                <img 
                  src={section.image} 
                  alt={section.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              
              {/* Content Section */}
              <div className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${section.color} text-white mb-4`}>
                  <FontAwesomeIcon icon={section.icon} size="lg" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2">{section.title}</h2>
                <p className="text-gray-600 mb-6">{section.description}</p>
                
                <button className="flex items-center text-green-600 hover:text-green-800 font-semibold">
                  Explore
                  <FontAwesomeIcon icon={faArrowLeft} className="ml-2 transform rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Farmer Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700 mb-2">25+</div>
              <p className="text-gray-600">Crops Listed</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-700 mb-2">18</div>
              <p className="text-gray-600">Successful Sales</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-700 mb-2">94%</div>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm mt-8">
        &copy; {new Date().getFullYear()} CropBoom. All rights reserved.
      </footer>
    </div>
  );
}

export default FarmerShop;