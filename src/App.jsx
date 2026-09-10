import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Components/Landing/Landing";
import SignIn from "./Components/Landing/SignIn";
import FarmerRegistrationForm from "./Components/Landing/FarmerRegistrationForm";
import BuyerRegistrationForm from "./Components/Landing/BuyerRegistrationForm";
import BuyerHomePage from "./Components/Buyer/BuyerHomePage";
import FarmerHomePage from "./Components/Farmer/FarmerHomePage";
import UploadCropForm from "./Components/Farmer/UploadCropForm";
import MyCropListings from "./Components/Farmer/MyCropListings";
import BuyerCart from "./Components/Buyer/BuyerCart";
import BuyNowPage from "./Components/Buyer/BuyNowPage";
import BuyerProfile from "./Components/Buyer/BuyerProfile";
import EditBuyerProfile from "./Components/Buyer/EditBuyerProfile";
import BuyerOrders from "./Components/Buyer/BuyerOrders";
import BookingsPage from "./Components/Farmer/BookingsPage";
import FarmerProfile from "./Components/Farmer/FarmerProfile";
import ViewListing from "./Components/Farmer/ViewListing";
import EditListing from "./Components/Farmer/EditListing";
import BuyerChat from "./Components/Buyer/BuyerChat";
import CropRecommendation from "./Components/Farmer/CropRecommendation";
import PlantDiseaseDetection from "./Components/Farmer/PlantDiseaseDetection";
import FarmerShop from "./Components/Farmer/FarmerShop";
import CropPriceTracker from "./Components/Farmer/CropPriceTracker";
import OrganicFarmingGuide from "./Components/Farmer/OrganicFarmingGuide";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Registration */}
        <Route path="/register/farmer" element={<FarmerRegistrationForm />} />
        <Route path="/register/buyer" element={<BuyerRegistrationForm />} />

        {/* Home Pages */}
        <Route path="/BuyerHomePage" element={<ProtectedRoute><BuyerHomePage /></ProtectedRoute>} />
        <Route path="/FarmerHomePage" element={<ProtectedRoute><FarmerHomePage /></ProtectedRoute>} />

        {/* Farmer Routes */}
        <Route path="/farmer/upload-crop" element={<ProtectedRoute><UploadCropForm /></ProtectedRoute>} />
        <Route path="/farmer/crop-listings" element={<ProtectedRoute><MyCropListings /></ProtectedRoute>} />
        <Route path="/farmer/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/farmer/profile" element={<ProtectedRoute><FarmerProfile /></ProtectedRoute>} />
        <Route path="/farmer/listings/:id" element={<ProtectedRoute><ViewListing /></ProtectedRoute>} />
        <Route path="/farmer/listings/edit/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
        <Route path="/disease-prediction" element={<ProtectedRoute><PlantDiseaseDetection /></ProtectedRoute>} />
        <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
        <Route path="/farmer/shop" element={<ProtectedRoute><FarmerShop /></ProtectedRoute>} />
        <Route path="/crop-price-tracker" element={<ProtectedRoute><CropPriceTracker /></ProtectedRoute>} />
        <Route path="/farmer/organic-guide" element={<ProtectedRoute><OrganicFarmingGuide /></ProtectedRoute>} />

        {/* Buyer Routes */}
        <Route path="/buyer/cart" element={<ProtectedRoute><BuyerCart /></ProtectedRoute>} />
        <Route path="/buyer/checkout" element={<ProtectedRoute><BuyNowPage /></ProtectedRoute>} />
        <Route path="/buyer/profile" element={<ProtectedRoute><BuyerProfile /></ProtectedRoute>} />
        <Route path="/buyer/profile/edit" element={<ProtectedRoute><EditBuyerProfile /></ProtectedRoute>} />
        <Route path="/buyer/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
        <Route path="/buyer/chat" element={<ProtectedRoute><BuyerChat /></ProtectedRoute>} />

        {/* Common edit profile route with role param */}
        <Route path="/edit-profile/:role" element={<ProtectedRoute><EditBuyerProfile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
