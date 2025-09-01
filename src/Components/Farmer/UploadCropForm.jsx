import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUpload, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

async function analyzeImage(base64Image, cropName) {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing. Please configure it.");
    }
    const prompt = `Analyze the quality of ${cropName} in exactly 2 words (like "High Quality" or "Low Quality"). Then estimate current market price per kg in Indian Rupees (just the number range like "20-24"). Format response as: "Quality: [2 words]\nPrice: ₹[range]"`;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                inline_data: {
                                    mime_type: 'image/jpeg',
                                    data: base64Image,
                                },
                            },
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const result = response.data;
        if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return { analysis: result.candidates[0].content.parts[0].text };
        }
        return { error: 'Unexpected response from Gemini' };
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return { error: error.message || 'Failed to analyze image' };
    }
}

function UploadCropFormSimplified() {
    const [cropName, setCropName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('kg');
    const [address, setAddress] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisData, setAnalysisData] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const location = useLocation();
    
    const emailFromState = location.state?.email;
    const email = emailFromState || localStorage.getItem("farmerEmail") || "";
    useEffect(() => {
        if (emailFromState) {
            localStorage.setItem("farmerEmail", emailFromState);
        }
        if (!email) {
            setError("Farmer email is missing. Please login again.");
        }
    }, [emailFromState, email]);


    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [cropNameError, setCropNameError] = useState('');
    const listingsurl=`/farmer/crop-listings?email=${encodeURIComponent(email)}`;

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

    const showSuccessToast = (message, callback) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: callback,
        });
    };

    const handleBackClick = () => {
        navigate('/farmer/shop', { state: { email } });
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
        setAnalysisResult(null);
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
        setAnalysisResult(null);
        setAnalysisData({});
    };

    const handleCropNameChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value)) {
            setCropName(value);
            setCropNameError('');
        } else {
            setCropNameError('Crop name can only contain letters and spaces');
        }
    };

    const parseAnalysisResult = (result) => {
        if (!result) return {};

        const lines = result.split('\n');
        const parsedData = {};

        lines.forEach(line => {
            if (line.startsWith('Quality:')) {
                parsedData.quality = line.replace('Quality:', '').trim();
            } else if (line.startsWith('Price:')) {
                parsedData.price = line.replace('Price:', '').trim();
                const priceMatch = parsedData.price.match(/\d+-\d+/);
                if (priceMatch) {
                    parsedData.priceRange = priceMatch[0];
                }
            }
        });

        return parsedData;
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!image) {
            showErrorToast('Please upload an image first');
            return;
        }
        if (!cropName) {
            showErrorToast('Please enter crop name');
            return;
        }

        setLoading(true);
        try {
            const base64Image = await toBase64(image);
            const analysis = await analyzeImage(base64Image, cropName);
            setAnalysisResult(analysis);

            if (analysis.error) {
                showErrorToast('Analysis failed: ' + analysis.error);
            } else {
                const parsedData = parseAnalysisResult(analysis.analysis);
                setAnalysisData(parsedData);
                showSuccessToast('Crop analyzed successfully!');
            }
        } catch (error) {
            showErrorToast('Analysis failed: ' + error.message);
            setAnalysisResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!cropName || !quantity || !address) {
            showErrorToast('Please fill all required fields');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('cropName', cropName);
            formData.append('quantity', parseFloat(quantity));
            formData.append('unit', unit);
            formData.append('address', address);
            formData.append('email', email);
            if (image) formData.append('CropImage', image);

            if (analysisData.quality) {
                formData.append('quality', analysisData.quality);
            }
            if (analysisData.priceRange) {
                formData.append('priceRange', analysisData.priceRange);
            }

            await axios.post('http://localhost:8080/api/crops/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            showSuccessToast('Crop uploaded successfully!', () => {
                navigate(listingsurl);
            });

            setCropName('');
            setQuantity('');
            setAddress('');
            setImage(null);
            setImagePreview(null);
            setAnalysisResult(null);
            setAnalysisData({});

        } catch (error) {
            showErrorToast('Upload failed: ' + (error.response?.data?.message || error.message));
            setUploading(false);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (!GEMINI_API_KEY) {
            setError("Gemini API key is missing");
        }
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, []);

    return (
        <div className="min-h-screen bg-green-50 flex justify-center items-center py-10 px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative">
                <button
                    onClick={handleBackClick}
                    className="absolute top-6 left-6 text-green-600 hover:text-green-800 transition-colors"
                    aria-label="Go back"
                >
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                </button>

                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
                    <FontAwesomeIcon icon={faCloudUpload} className="mr-2" />
                    Upload Your Crop
                </h2>

                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Crop Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2 rounded-lg border ${cropNameError ? 'border-red-500' : 'border-gray-300'
                                        } focus:outline-none focus:ring-1 focus:ring-green-500`}
                                    placeholder="e.g. Wheat"
                                    value={cropName}
                                    onChange={handleCropNameChange}
                                    required
                                />
                                {cropNameError && <p className="text-red-500 text-sm mt-1">{cropNameError}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Quantity <span className="text-red-500">*</span>
                                </label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="e.g. 100"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <select
                                        className="px-4 py-2 rounded-r-lg border-l-0 border border-gray-300 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="quintal">Quintal</option>
                                        <option value="ton">Ton</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="Your address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Crop Image <span className="text-red-500">*</span>
                                </label>
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Crop preview"
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
                                        className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                            <FontAwesomeIcon icon={faCloudUpload} className="text-gray-400 text-3xl mb-2" />
                                            <p className="text-sm text-gray-500 text-center">
                                                {isDragging ? 'Drop your image here' : 'Drag & drop your image or click to browse'}
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

                            {analysisResult && (
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <h3 className="text-lg font-semibold text-green-600 mb-2">Analysis Result</h3>
                                    {analysisResult.error ? (
                                        <p className="text-red-500">{analysisResult.error}</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {analysisResult.analysis.split('\n').map((line, i) => (
                                                <p key={i} className="font-medium">{line}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between pt-2">
                        <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={loading || !image}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Crop'}
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading || !cropName || !quantity || !address}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : 'Upload Crop'}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer position="bottom-center" />
        </div>
    );
}

export default UploadCropFormSimplified;
