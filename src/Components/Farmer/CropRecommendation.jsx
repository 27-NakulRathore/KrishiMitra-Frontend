import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CropRecommendation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    const fields = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall'];
    
    fields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      } else if (isNaN(formData[field])) {
        newErrors[field] = 'Must be a number';
      }
    });

    if (formData.ph && (formData.ph < 0 || formData.ph > 14)) {
      newErrors.ph = 'pH must be between 0-14';
    }
    if (formData.humidity && (formData.humidity < 0 || formData.humidity > 100)) {
      newErrors.humidity = 'Humidity must be between 0-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const API_URL = import.meta.env.VITE_API_URL;
  const callBackendAPI = async (data) => {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        N: Number(data.nitrogen),
        P: Number(data.phosphorus),
        K: Number(data.potassium),
        temperature: Number(data.temperature),
        humidity: Number(data.humidity),
        ph: Number(data.ph),
        rainfall: Number(data.rainfall),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch prediction");
    }

    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const response = await callBackendAPI(formData);
        setPrediction(response.recommended_crop); // 👈 backend returns this
        showSuccessToast('Crop recommendation generated!');
      } catch (error) {
        console.error("Prediction error:", error);
        showErrorToast('Failed to get recommendation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formFields = [
    { name: 'nitrogen', label: 'Nitrogen (N)', placeholder: 'Enter N' },
    { name: 'phosphorus', label: 'Phosphorus (P)', placeholder: 'Enter P' },
    { name: 'potassium', label: 'Potassium (K)', placeholder: 'Enter K' },
    { name: 'temperature', label: 'Temperature (°C)', placeholder: 'Enter temp' },
    { name: 'humidity', label: 'Humidity (%)', placeholder: 'Enter %', min: 0, max: 100 },
    { name: 'ph', label: 'Soil pH', placeholder: '0-14', min: 0, max: 14, step: 0.1 },
    { name: 'rainfall', label: 'Rainfall (mm)', placeholder: 'Enter mm', min: 0 }
  ];

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleBackClick} className="text-green-600 hover:text-green-800">
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </button>
          <h2 className="text-xl font-bold text-green-700 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Crop Recommendation
          </h2>
          <div className="w-6"></div>
        </div>

        {prediction ? (
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Recommended Crop</h3>
            <div className="text-3xl font-bold text-green-800 mb-5 p-3 bg-green-100 rounded-lg">
              {prediction}
            </div>
            <button
              onClick={() => setPrediction(null)}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg w-full"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`w-full p-2 text-sm rounded border ${
                        errors[field.name] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg w-full mt-4 flex items-center justify-center"
              >
                {isLoading ? "Analyzing..." : "GET RECOMMENDATION"}
              </button>
            </form>
          </>
        )}
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}

export default CropRecommendation;
