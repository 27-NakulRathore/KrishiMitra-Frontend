import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faTimes, faArrowLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Translation runs on the backend (POST /api/ai/translate) rather than calling Gemini from the
// browser. Vite inlines every VITE_* variable into the published bundle, so a Gemini key used
// here would be readable by every visitor. The key now lives only in the server environment.
async function translateText(text, targetLang = "hi") {
  try {
    const response = await apiClient.post('/api/ai/translate', { text, targetLang });
    return response.data?.translatedText || text;
  } catch (err) {
    // Returning the original text keeps the report usable if translation is unavailable.
    return text;
  }
}

async function detectDisease(imageFile, plantName) {
  try {
    const formData = new FormData();
    formData.append("image", imageFile); // pass the File directly
    formData.append("plantName", plantName);

    const response = await apiClient.post('/api/disease/detect', formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data;
  } catch (err) {
    console.error("Error calling backend:", err);
    return { error: err.response?.data?.message || err.message || "Failed to detect disease" };
  }
}





function PlantDiseaseDetection() {
  const [plantName, setPlantName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [translatedText, setTranslatedText] = useState(null);
const [isHindi, setIsHindi] = useState(false);
const [translating, setTranslating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleImageChange = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      showErrorToast('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    if (file.size > maxSize) {
      showErrorToast('File size must be less than 10MB');
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setDetectionResult(null);
    setError(null);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  }, []);

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setDetectionResult(null);
  };

  const parseDetectionResult = (result) => {
    if (!result) return {};

    const lines = result.split('\n');
    const parsedData = {};

    lines.forEach(line => {
      if (line.startsWith('Disease:')) {
        parsedData.disease = line.replace('Disease:', '').trim();
      } else if (line.startsWith('Severity:')) {
        parsedData.severity = line.replace('Severity:', '').trim();
      } else if (line.startsWith('Treatment:')) {
        parsedData.treatment = line.replace('Treatment:', '').trim();
      }
    });

    return parsedData;
  };

  const handleDetect = async (e) => {
  e.preventDefault();
  if (!image) {
    showErrorToast('Please upload an image first');
    return;
  }

  setLoading(true);
  try {
    const detection = await detectDisease(image, plantName); // send actual File
    setDetectionResult(detection);

    if (detection.error) {
      showErrorToast('Detection failed: ' + detection.error);
    } else {
      showSuccessToast('Disease detected successfully!');
    }

  } catch (error) {
    showErrorToast('Detection failed: ' + error.message);
    setDetectionResult({ error: error.message });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-green-50 flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative">
        {/* Back Arrow Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 text-green-600 hover:text-green-800 transition-colors"
          aria-label="Go back"
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>

        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
          Plant Disease Detection
        </h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Plant Name (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g. Tomato, Wheat"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                />
              </div>

              {detectionResult && !detectionResult.error && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-green-600 mb-2">Detection Result</h3>

                    {/* Language Toggle Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        setTranslating(true);

                        const originalText = `
              Disease: ${detectionResult.disease}
              Severity: ${detectionResult.severity}
              Treatment: ${detectionResult.treatment}
                        `;

                        const result = await translateText(originalText, isHindi ? "en" : "hi");

                        setTranslatedText(result);
                        setIsHindi(!isHindi);
                        setTranslating(false);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded-md"
                    >
                      {translating
                        ? "Translating..."
                        : isHindi
                        ? "Show English"
                        : "Translate to Hindi"}
                    </button>
                  </div>

                  {/* ORIGINAL English result (hide if Hindi displayed) */}
                  {!isHindi && (
                    <>
                      <p>
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-sm ${
                            detectionResult.disease === "Healthy"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Disease: {detectionResult.disease}
                        </span>
                      </p>
                      <p><strong>Severity:</strong> {detectionResult.severity}</p>
                      <p><strong>Treatment:</strong> {detectionResult.treatment}</p>
                    </>
                  )}

                  {/* HINDI translated text */}
                  {isHindi && translatedText && (
                    <div className="mt-2 bg-white border border-gray-300 p-3 rounded-md text-gray-800 whitespace-pre-line">
                      {translatedText}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Plant Image <span className="text-red-500">*</span>
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Plant preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                      isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <FontAwesomeIcon icon={faLeaf} className="text-gray-400 text-3xl mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        {isDragging ? 'Drop your image here' : 'Drag & drop plant image or click to browse'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG (max 10MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageChange(e.target.files[0])}
                        accept="image/jpeg, image/png, image/jpg"
                        required
                      />
                    </label>
                  </div>
                )}
              </div>

              {detectionResult?.error && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
                  <p className="text-red-500">{detectionResult.error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleDetect}
              disabled={loading || !image}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
                  Detect Disease
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}

export default PlantDiseaseDetection;