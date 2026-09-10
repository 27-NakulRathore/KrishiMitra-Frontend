import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUpload,
  faTimes,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// ---------------------- HELPERS: normalize / canonicalize / matchesDetected ----------------------
const normalize = (s) =>
  s
    ? s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
    : "";

const canonicalize = (s) => {
  const n = normalize(s);
  if (["paddy", "rice paddy"].includes(n)) return "rice";
  if (["maize", "corn"].includes(n)) return "maize";
  // add more synonyms if needed
  return n;
};

const matchesDetected = (userCrop, detected) => {
  if (!detected) return true;
  const u = canonicalize(userCrop);
  const d = canonicalize(detected);
  if (u === d) return true;
  if (u.includes(d) || d.includes(u)) return true;
  return false;
};

// ---------------------- helper to convert file -> base64 ----------------------
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function UploadCropFormSimplified() {
  const [cropName, setCropName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const location = useLocation();
  const [error, setError] = useState(null);

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

  const [cropNameError, setCropNameError] = useState("");
  const listingsurl = `/farmer/crop-listings?email=${encodeURIComponent(
    email
  )}`;

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
    navigate("/farmer/shop", { state: { email } });
  };

  const handleImageChange = (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      showErrorToast("Only JPG, JPEG, and PNG files are allowed");
      return;
    }

    if (file.size > maxSize) {
      showErrorToast("File size must be less than 10MB");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      // previously passed fake event — call with the file directly
      handleImageChange(file);
    }
  };

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
      setCropNameError("");
    } else {
      setCropNameError("Crop name can only contain letters and spaces");
    }
  };

  // parseAnalysisResult now extracts Quality, Price, and DetectedCrop
  const parseAnalysisResult = (result) => {
    if (!result) return {};

    const lines = result.split("\n");
    const parsedData = {};

    lines.forEach((line) => {
      const ln = line.trim();
      if (ln.toLowerCase().startsWith("quality:")) {
        parsedData.quality = ln.replace(/quality:/i, "").trim();
      } else if (ln.toLowerCase().startsWith("price:")) {
        parsedData.price = ln.replace(/price:/i, "").trim();
        // The model writes the currency symbol on BOTH bounds, e.g. "₹25 - ₹35 per kg".
        // A plain /\d+\s*-\s*\d+/ cannot match that, because "₹" sits between the dash and
        // the second number — which left priceRange undefined and blocked every upload.
        // Allow an optional currency prefix (₹, Rs, INR) before either bound.
        const CURRENCY = "(?:₹|Rs\\.?|INR)?\\s*";
        const priceMatch = parsedData.price.match(
          new RegExp(CURRENCY + "(\\d+(?:\\.\\d+)?)\\s*-\\s*" + CURRENCY + "(\\d+(?:\\.\\d+)?)")
        );
        if (priceMatch) {
          parsedData.priceRange = `${priceMatch[1]}-${priceMatch[2]}`;
        } else {
          // Single price rather than a range, e.g. "₹30 per kg".
          const single = parsedData.price.match(new RegExp(CURRENCY + "(\\d+(?:\\.\\d+)?)"));
          if (single) parsedData.priceRange = single[1];
        }
      } else if (ln.toLowerCase().startsWith("detectedcrop:")) {
        parsedData.detectedCrop = ln.replace(/detectedcrop:/i, "").trim();
      } else if (ln.toLowerCase().startsWith("detected:")) {
        // fallback if model outputs "Detected: Rice"
        const parts = ln.split(":");
        if (parts.length > 1)
          parsedData.detectedCrop = parts.slice(1).join(":").trim();
      }
    });

    return parsedData;
  };

  const handleAnalyze = async (e) => {
  e.preventDefault();

  if (!image) {
    showErrorToast("Please upload an image first");
    return;
  }

  if (!cropName) {
    showErrorToast("Please enter crop name");
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("cropName", cropName);

    // `await` matters: without it `res` is a Promise, `res.data` is undefined, and the
    // "Invalid AI response" branch below fires on every single call regardless of what
    // Gemini actually returned.
    const res = await apiClient.post(
      `/api/ai/analyze-crop`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );


    // ✅ Extract ONLY required data
    const text =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Invalid AI response");
    }

    const parsed = parseAnalysisResult(text);
    setAnalysisData(parsed);

    showSuccessToast("Crop analyzed successfully!");
  } catch (error) {
    console.error(error);
    showErrorToast("Analysis failed");
  } finally {
    setLoading(false);
  }
};


  const handleUpload = async (e) => {
    e.preventDefault();

    // Validate AI-detected crop vs farmer-entered crop
    if (analysisData && analysisData.detectedCrop) {
      if (!matchesDetected(cropName, analysisData.detectedCrop)) {
        showErrorToast(
          `Image detected as '${analysisData.detectedCrop}', but you entered '${cropName}'. Please upload a matching image or correct crop name.`
        );
        return;
      }
    } else {
      // Optionally you may prevent upload if analysis was never performed:
      showErrorToast(
        "Please analyze the crop image before uploading (AI detection missing)."
      );
      return;
    }

    if (!cropName || !quantity || !address) {
      showErrorToast("Please fill all required fields");
      return;
    }

    if (!analysisData.quality || !analysisData.priceRange) {
      showErrorToast("Please analyze the crop image before uploading");
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      showErrorToast("Quantity must be greater than 0");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cropName", cropName);
      formData.append("quantity", parseFloat(quantity));
      formData.append("unit", unit);
      formData.append("address", address);
      formData.append("email", email);

      if (image) formData.append("cropImage", image);
      // append detectedCrop so backend can validate
      if (analysisData.detectedCrop)
        formData.append("detectedCrop", analysisData.detectedCrop);

      // Always include AI analysis results
      formData.append("qualityRating", analysisData.quality);
      formData.append("priceRange", analysisData.priceRange);

      // calculate pricePerKg (required by backend)
      if (analysisData.priceRange) {
        //   const [low, high] = analysisData.priceRange.split("-").map(Number);
        //   const pricePerKg = (low + high) / 2;
        //   formData.append("pricePerKg", pricePerKg);
        let quantityInKg = parseFloat(quantity);
        if (unit === "quintal") quantityInKg *= 100;
        if (unit === "ton") quantityInKg *= 1000;

        formData.append("quantity", quantityInKg);
        formData.append("unit", "kg");
      }

      await apiClient.post(
        `/api/crops/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showSuccessToast("Crop uploaded successfully!", () => {
        navigate(listingsurl);
      });

      // reset form
      setCropName("");
      setQuantity("");
      setAddress("");
      setImage(null);
      setImagePreview(null);
      setAnalysisResult(null);
      setAnalysisData({});
    } catch (error) {
      showErrorToast(
        "Upload failed: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
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
                  className={`w-full px-4 py-2 rounded-lg border ${
                    cropNameError ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-1 focus:ring-green-500`}
                  placeholder="e.g. Wheat"
                  value={cropName}
                  onChange={handleCropNameChange}
                  required
                />
                {cropNameError && (
                  <p className="text-red-500 text-sm mt-1">{cropNameError}</p>
                )}
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
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="text-red-500"
                      />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                      isDragging
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <FontAwesomeIcon
                        icon={faCloudUpload}
                        className="text-gray-400 text-3xl mb-2"
                      />
                      <p className="text-sm text-gray-500 text-center">
                        {isDragging
                          ? "Drop your image here"
                          : "Drag & drop your image or click to browse"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, JPEG, PNG (max 10MB)
                      </p>
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
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    Analysis Result
                  </h3>
                  {analysisResult.error ? (
                    <p className="text-red-500">{analysisResult.error}</p>
                  ) : (
                    <div className="space-y-1">
                      {analysisResult.analysis.split("\n").map((line, i) => (
                        <p key={i} className="font-medium">
                          {line}
                        </p>
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
              {loading ? "Analyzing..." : "Analyze Crop"}
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !cropName || !quantity || !address}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Crop"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}

export default UploadCropFormSimplified;
