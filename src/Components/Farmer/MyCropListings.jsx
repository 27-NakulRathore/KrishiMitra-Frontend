import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faCheckCircle, faMapMarkerAlt, faChartLine, faStar, faCalendarAlt, faArrowLeft, faLeaf } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function MyCropListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [confirmingSold, setConfirmingSold] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/farmer/shop', { state: { email } });
  };

  // ✅ Helper function to safely parse dates
  const parseDate = (value) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const encodedEmail = encodeURIComponent(email);

        const response = await axios.get(
          `http://localhost:8080/api/crops/farmer/${encodedEmail}/listings`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        const listings = Array.isArray(response.data) ? response.data : [];
        const listingsWithData = listings.map(listing => ({
          ...listing,
          cropName: listing.cropName || 'Unnamed Crop',
          quantity: listing.quantity || 0,
          unit: listing.unit || 'kg',
          status: listing.status || 'unknown',
          pricePerKg: listing.pricePerKg || null,
          priceRange: listing.priceRange || null,
          qualityRating: listing.qualityRating || null,
          address: listing.address || 'Not specified',
          listedOn: parseDate(listing.listedOn) || new Date(), // ✅ safer date
          analysisDate: parseDate(listing.analysisDate),       // ✅ safer date
          imageUrl: listing.imageData 
            ? `data:image/jpeg;base64,${listing.imageData}`
            : null
        }));

        setListings(listingsWithData);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch listings');
        setLoading(false);
      }
    };

    if (email) {
      fetchListings();
    } else {
      setError('No farmer email found');
      setLoading(false);
    }
  }, [email]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/crops/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      setListings(listings.filter(listing => listing.id !== id));
      setConfirmingDelete(null);
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing. Please try again.');
    }
  };

  const handleMarkAsSold = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/crops/${id}/status`,
        { status: 'sold' },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }}
      );

      setListings(listings.map(listing =>
        listing.id === id ? { ...listing, status: 'sold' } : listing
      ));
      setConfirmingSold(null);
    } catch (err) {
      console.error('Error marking as sold:', err);
      alert('Failed to mark as sold. Please try again.');
    }
  };

  // ✅ Robust date formatter
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return 'N/A';
    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  const handleViewListing = (listingId) => {
    navigate(`/farmer/listings/${listingId}`, { state: { email } });
  };

  const handleEditListing = (listing) => {
    navigate(`/farmer/listings/edit/${listing.id}`, { state: { listing, email } });
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading your listings...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: Oops!, here is some issue while loading your listings. Please try again later.
        <Link to="/FarmerHomePage" className="block text-blue-500 mt-2">Return to Home</Link>
      </div>
    );
  }

  if (!Array.isArray(listings) || listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/FarmerHomePage', { state: { email } })} 
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="mr-3 text-green-600" />
              Your Crop Listings
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FontAwesomeIcon 
              icon={faChartLine} 
              className="text-gray-300 text-5xl mb-4" 
            />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No crops listed yet</h2>
            <p className="text-gray-500 mb-6">Start by uploading your first crop to get visibility in the marketplace.</p>
            <Link
              to="/farmer/upload-crop"
              state={{ email }}  // ✅ pass email via navigation state
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              <FontAwesomeIcon icon={faLeaf} className="mr-2" />
              Go, Upload Here!
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 relative">
      {/* Back Arrow Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 text-green-600 hover:text-green-800 transition-colors"
        aria-label="Go back"
      >
        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
      </button>

      <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
        My Crop Listings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.cropName}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-crop.jpg';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-800">{listing.cropName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  listing.status === 'sold' ? 'bg-red-100 text-red-800' : 
                  listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status ? listing.status.charAt(0).toUpperCase() + listing.status.slice(1) : 'Unknown'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faChartLine} className="mr-2 text-gray-400" />
                  <span>{listing.quantity} {listing.unit}</span>
                </div>

                {listing.pricePerKg && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-2 text-gray-400" />
                    <span className="text-green-500 font-semibold">₹{listing.pricePerKg.toFixed(2)}/kg</span>
                  </div>
                )}

                {listing.priceRange && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-2 text-gray-400" />
                    <span>Price Range: ₹{listing.priceRange}</span>
                  </div>
                )}

                {listing.qualityRating && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faStar} className="mr-2 text-gray-400" />
                    <span>Quality: {listing.qualityRating}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                  <span className="truncate">{listing.address}</span>
                </div>

                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                  <span>Listed: {formatDate(listing.listedOn)}</span>
                </div>

                {listing.analysisDate && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                    <span>Analyzed: {formatDate(listing.analysisDate)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewListing(listing.id)}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-1" /> View
                </button>

                {listing.status !== 'sold' && (
                  <>
                    <button
                      onClick={() => handleEditListing(listing)}
                      className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 flex items-center text-sm"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                    </button>

                    {confirmingDelete === listing.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center text-sm"
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-1" /> Confirm
                        </button>
                        <button
                          onClick={() => setConfirmingDelete(null)}
                          className="px-3 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(listing.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center text-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                      </button>
                    )}

                    {confirmingSold === listing.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkAsSold(listing.id)}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 flex items-center text-sm"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Confirm
                        </button>
                        <button
                          onClick={() => setConfirmingSold(null)}
                          className="px-3 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingSold(listing.id)}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 flex items-center text-sm"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Mark as Sold
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCropListings;
