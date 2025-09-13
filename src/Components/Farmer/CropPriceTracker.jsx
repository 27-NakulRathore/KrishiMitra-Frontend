// src/components/CropPriceTracker.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CropPriceTracker() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    commodity: "",
    state: "",
    market: "",
  });
  const [errors, setErrors] = useState({});
  const [priceData, setPriceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_GOV_API_KEY;
  const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

  const showErrorToast = (message) => {
    toast.error(message, { autoClose: 2000 });
  };

  const showSuccessToast = (message) => {
    toast.success(message, { autoClose: 2000 });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.commodity) newErrors.commodity = "Commodity is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.market) newErrors.market = "Market is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchCropPrices = async () => {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[commodity]=${encodeURIComponent(
      formData.commodity
    )}&filters[state]=${encodeURIComponent(
      formData.state
    )}&filters[market]=${encodeURIComponent(formData.market)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch crop prices");
    }
    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const data = await fetchCropPrices();
        if (data.records && data.records.length > 0) {
          setPriceData(data.records[0]); // take first record
          showSuccessToast("Price data fetched successfully!");
        } else {
          setPriceData(null);
          showErrorToast("No data found for this selection.");
        }
      } catch (error) {
        console.error("API Error:", error);
        showErrorToast("Failed to fetch prices. Try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackClick}
            className="text-green-600 hover:text-green-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </button>
          <h2 className="text-xl font-bold text-green-700 flex items-center">
            <FontAwesomeIcon icon={faRupeeSign} className="mr-2" />
            Crop Price Tracker
          </h2>
          <div className="w-6"></div>
        </div>

        {priceData ? (
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-green-700 mb-3">
              Price Details
            </h3>
            <div className="p-4 bg-green-100 rounded-lg text-left">
              <p className="text-sm text-gray-700">
                <strong>Commodity:</strong> {priceData.commodity}
              </p>
              <p className="text-sm text-gray-700">
                <strong>State:</strong> {priceData.state}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Market:</strong> {priceData.market}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Date:</strong> {priceData.arrival_date}
              </p>
              <p className="text-sm text-green-700 font-semibold">
                Min Price: ₹{priceData.min_price}
              </p>
              <p className="text-sm text-green-700 font-semibold">
                Max Price: ₹{priceData.max_price}
              </p>
              <p className="text-sm text-green-800 font-bold">
                Modal Price: ₹{priceData.modal_price}
              </p>
            </div>
            <button
              onClick={() => setPriceData(null)}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg w-full mt-4"
            >
              Track Again
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Commodity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commodity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="commodity"
                  value={formData.commodity}
                  onChange={handleChange}
                  placeholder="e.g., Wheat"
                  className={`w-full p-2 text-sm rounded border ${
                    errors.commodity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.commodity && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.commodity}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g., Madhya Pradesh"
                  className={`w-full p-2 text-sm rounded border ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                )}
              </div>

              {/* Market */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="market"
                  value={formData.market}
                  onChange={handleChange}
                  placeholder="e.g., Indore"
                  className={`w-full p-2 text-sm rounded border ${
                    errors.market ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.market && (
                  <p className="text-red-500 text-xs mt-1">{errors.market}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg w-full mt-4 flex items-center justify-center"
              >
                {isLoading ? "Fetching..." : "GET PRICES"}
              </button>
            </form>
          </>
        )}
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}

export default CropPriceTracker;
