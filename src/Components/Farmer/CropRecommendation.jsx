import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartLine, faClock, faSeedling } from '@fortawesome/free-solid-svg-icons';

/**
 * Crop Recommendation — temporarily disabled.
 *
 * The prediction is served by a separate Flask/scikit-learn service (see
 * KrishiMitra-Frontend/src/Components/Models/app.py) that has never been deployed. The Spring
 * backend has no /api/predict route, so the form could only ever fail:
 *   - originally it called http://127.0.0.1:5000/predict, i.e. the visitor's OWN machine
 *   - after the API-client migration it called {VITE_API_URL}/api/predict, which 500s
 *
 * Rather than show a form that always errors, this renders a "coming soon" state. It makes no
 * network calls at all, so there is nothing to fail and nothing logged to the console.
 *
 * To re-enable: deploy the Flask service, expose its URL as VITE_ML_API_URL, and restore the
 * form (see git history for this file at commit 6a20c87 for the original implementation).
 */
function CropRecommendation() {
  const navigate = useNavigate();

  const inputsPreview = [
    'Nitrogen (N)',
    'Phosphorus (P)',
    'Potassium (K)',
    'Temperature (°C)',
    'Humidity (%)',
    'Soil pH',
    'Rainfall (mm)',
  ];

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-green-600 hover:text-green-800"
            aria-label="Go back"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </button>
          <h2 className="text-xl font-bold text-green-700 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Crop Recommendation
          </h2>
          <div className="w-6" />
        </div>

        {/* Coming soon */}
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="text-green-600 text-2xl" />
          </div>

          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Coming soon
          </span>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Crop recommendation is not available yet
          </h3>

          <p className="text-gray-600 text-sm mb-6">
            We&apos;re finishing the machine-learning service that suggests the best crop for your
            soil and local climate. This feature will be enabled here as soon as it&apos;s ready.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left mb-6">
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
              <FontAwesomeIcon icon={faSeedling} className="mr-2 text-green-600" />
              It will recommend a crop from:
            </p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {inputsPreview.map((field) => (
                <li key={field} className="text-xs text-gray-500 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 mr-2 shrink-0" />
                  {field}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => navigate('/FarmerHomePage')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropRecommendation;
