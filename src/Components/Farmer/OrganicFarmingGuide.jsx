import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faSeedling,
  faRecycle,
  faFlask,
  faCheckCircle,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function OrganicFarmingGuide() {
  const navigate = useNavigate();

  const handleBackClick = () => navigate(-1);

  return (
    <div className="min-h-screen bg-white-50 flex justify-center items-start py-10 px-4">
      <div className=" rounded-2xl shadow-lg p-8 w-full max-w-4xl relative">

        {/* Back button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 text-green-600 hover:text-green-800 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} size="xl" />
        </button>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-green-700 text-center mb-6">
          🌿 Organic Farming Guide
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Learn sustainable organic practices—from soil preparation to eco-friendly pest control and certification.
        </p>

        {/* Sections */}
        <div className="space-y-10">

          {/* Soil Health */}
          <section className="p-6 bg-green-100 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-green-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faSeedling} /> Soil Health Management
            </h2>
            <p className="text-gray-700">
              Healthy soil is the foundation of organic farming. Improve your soil using:
            </p>

            <ul className="mt-3 space-y-2 text-gray-700 list-disc ml-6">
              <li>Compost and organic manure</li>
              <li>Crop rotation</li>
              <li>Green manuring</li>
              <li>Mulching to retain moisture</li>
            </ul>
          </section>

          {/* Eco-Friendly Pest Control */}
          <section className="p-6 bg-green-100 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-green-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faRecycle} /> Eco-Friendly Pest Control
            </h2>
            <p className="text-gray-700">
              Use natural pest control methods to protect crops without chemicals:
            </p>
            <ul className="mt-3 space-y-2 list-disc text-gray-700 ml-6">
              <li>Neem oil spray</li>
              <li>Traps & pheromone lures</li>
              <li>Biological pest control (ladybugs, wasps)</li>
              <li>Ash or chilli-based organic sprays</li>
            </ul>
          </section>

          {/* Organic Inputs */}
          <section className="p-6 bg-green-100 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-green-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faFlask} /> Organic Inputs & Fertilizers
            </h2>
            <ul className="mt-3 space-y-2 text-gray-700 list-disc ml-6">
              <li>Vermicompost</li>
              <li>Farmyard manure (FYM)</li>
              <li>Biofertilizers (Azotobacter, PSB)</li>
              <li>Jeevamrutha & Ghanjeevamrutha</li>
            </ul>
          </section>

          {/* Certification */}
          <section className="p-6 bg-green-100 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-green-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} /> Organic Certification Steps
            </h2>
            <ol className="list-decimal ml-6 space-y-2 text-gray-700">
              <li>Register your farm with a certification agency</li>
              <li>Follow a 2–3 year conversion period</li>
              <li>Switch to 100% organic inputs</li>
              <li>Inspect and verify soil, crop, and farming practices</li>
              <li>Get certified and sell at premium prices</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OrganicFarmingGuide;
