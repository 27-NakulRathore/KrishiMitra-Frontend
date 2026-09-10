import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapMarkerAlt, faChartLine, faStar, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../api/client';

function ViewListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/crops/${id}`);

        if (!response.data) {
          throw new Error('No data returned from server');
        }

        const data = response.data;

        const listingData = {
          ...data,
          listedOn: data.listedOn ? new Date(data.listedOn) : new Date(),
          analysisDate: data.analysisDate ? new Date(data.analysisDate) : null,
          imageUrl: data.cropImageUrl
            ? `${import.meta.env.VITE_API_URL}${data.cropImageUrl}`
            : null
        };

        setListing(listingData);

        // // Safe logging after setting state
        // console.log("Listing image URL:", listingData.imageUrl);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch listing');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
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

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading listing details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error}
        <button 
          onClick={handleBackClick}
          className="block text-blue-500 mt-2"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-6 text-center text-gray-600">
        Listing not found
        <button 
          onClick={handleBackClick}
          className="block text-blue-500 mt-2"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <button
        onClick={handleBackClick}
        className="mb-6 text-green-600 hover:text-green-800 flex items-center"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to My Listings
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.cropName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-crop.jpg';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>

          <div className="p-6 md:w-1/2">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.cropName}</h1>
            
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                listing.status === 'sold' ? 'bg-red-100 text-red-800' : 
                listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {listing.status ? listing.status.charAt(0).toUpperCase() + listing.status.slice(1) : 'Unknown'}
              </span>
            </div>

            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faChartLine} className="mt-1 mr-3 text-gray-400" />
                <div>
                  <h3 className="font-semibold">Quantity</h3>
                  <p>{listing.quantity} {listing.unit}</p>
                </div>
              </div>

              {listing.pricePerKg && (
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faChartLine} className="mt-1 mr-3 text-gray-400" />
                  <div>
                    <h3 className="font-semibold">Price</h3>
                    <p className="text-green-500 font-semibold">₹{listing.pricePerKg.toFixed(2)} per kg</p>
                  </div>
                </div>
              )}

              {listing.qualityRating && (
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faStar} className="mt-1 mr-3 text-gray-400" />
                  <div>
                    <h3 className="font-semibold">Quality Rating</h3>
                    <p>{listing.qualityRating}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 mr-3 text-gray-400" />
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>{listing.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FontAwesomeIcon icon={faCalendarAlt} className="mt-1 mr-3 text-gray-400" />
                <div>
                  <h3 className="font-semibold">Listed On</h3>
                  <p>{formatDate(listing.listedOn)}</p>
                </div>
              </div>

              {listing.analysisDate && (
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mt-1 mr-3 text-gray-400" />
                  <div>
                    <h3 className="font-semibold">Analysis Date</h3>
                    <p>{formatDate(listing.analysisDate)}</p>
                  </div>
                </div>
              )}

              {listing.description && (
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="mt-1">{listing.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewListing;
