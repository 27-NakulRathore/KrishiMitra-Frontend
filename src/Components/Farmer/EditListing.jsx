import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../api/client';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const initialListing = location.state?.listing;
  const [listing, setListing] = useState(initialListing || {});
  const [loading, setLoading] = useState(!initialListing);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!initialListing) {
      const fetchListing = async () => {
        try {
          setLoading(true);
          const response = await apiClient.get(`/api/crops/${id}`);

          setListing(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching listing:', err);
          setError(err.response?.data?.message || err.message || 'Failed to fetch listing');
          setLoading(false);
        }
      };

      fetchListing();
    }
  }, [id, initialListing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setListing(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setListing(prev => ({
      ...prev,
      [name]: value ? parseFloat(value) : null
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setListing(prev => ({
      ...prev,
      [name]: value ? new Date(value) : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const updatedFields = {
        cropName: listing.cropName,
        quantity: listing.quantity,
        unit: listing.unit,
        pricePerKg: listing.pricePerKg,
        priceRange: listing.priceRange,
        qualityRating: listing.qualityRating,
        address: listing.address,
        description: listing.description,
        analysisDate: listing.analysisDate ? listing.analysisDate.toISOString() : null,
      };

      await apiClient.put(`/api/crops/${id}`, updatedFields);

      setSuccess(true);

      const updatedListing = listing;

      setTimeout(() => {
        navigate(-1);

      }, 1500);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      console.error('Date formatting error:', e);
      return '';
    }
  };

  if (loading && !listing) {
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

  return (
    <div className="container mx-auto py-8 px-4">
      <button
        onClick={handleBackClick}
        className="mb-6 text-green-600 hover:text-green-800 flex items-center"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to My Listings
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Crop Listing</h1>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Listing updated successfully! Redirecting back to your listings...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-gray-700 mb-2" htmlFor="cropName">
                Crop Name
              </label>
              <input
                type="text"
                id="cropName"
                name="cropName"
                value={listing.cropName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-gray-700 mb-2" htmlFor="quantity">
                Quantity
              </label>
              <div className="flex">
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={listing.quantity || ''}
                  onChange={handleNumberChange}
                  className="w-3/4 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  name="unit"
                  value={listing.unit || 'kg'}
                  onChange={handleChange}
                  className="w-1/4 px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="ton">ton</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-gray-700 mb-2" htmlFor="pricePerKg">
                Price per kg (₹)
              </label>
              <input
                type="number"
                id="pricePerKg"
                name="pricePerKg"
                value={listing.pricePerKg || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="block text-gray-700 mb-2" htmlFor="priceRange">
                Price Range
              </label>
              <input
                type="text"
                id="priceRange"
                name="priceRange"
                value={listing.priceRange || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 50-100"
              />
            </div>

            <div className="form-group">
              <label className="block text-gray-700 mb-2" htmlFor="qualityRating">
                Quality Rating
              </label>
              <select
                id="qualityRating"
                name="qualityRating"
                value={listing.qualityRating || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select quality</option>
                <option value="Premium">Premium</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-gray-700 mb-2" htmlFor="analysisDate">
                Analysis Date
              </label>
              <input
                type="date"
                id="analysisDate"
                name="analysisDate"
                value={formatDateForInput(listing.analysisDate)}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="block text-gray-700 mb-2" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={listing.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="2"
                required
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={listing.description || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditListing;
