import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faEdit,
    faMapMarkerAlt,
    faPhone,
    faBirthdayCake,
    faIdCard,
    faBriefcase
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../api/client';

function BuyerProfile() {
    const navigate = useNavigate();
    const [buyer, setBuyer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const email = localStorage.getItem("email");
        if (email) {
            apiClient.get(`/api/buyer/${email}`)
                .then(res => {
                    setBuyer(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load buyer", err);
                    setLoading(false);
                });
        } else {
            console.warn("No email found in localStorage");
            setLoading(false);
        }
    }, []);

    const handleEditProfile = () => {
        navigate('/edit-profile/buyer'); // <- Corrected route
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faUserCircle} size="6x" className="text-green-500 mx-auto block mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
                                <p className="text-gray-600">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="text-center">
                            <FontAwesomeIcon icon={faUserCircle} size="6x" className="text-green-500 mx-auto block mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            <div className="py-4 flex items-center">
                                <FontAwesomeIcon icon={faUserCircle} className="mr-2 text-gray-700" />
                                <label className="block text-sm font-medium text-gray-700">Name:</label>
                                <p className="mt-1 ml-2 text-gray-900">{buyer?.name || 'N/A'}</p>
                            </div>
                            <div className="py-4 flex items-center">
                                <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-700" />
                                <label className="block text-sm font-medium text-gray-700">Email:</label>
                                <p className="mt-1 ml-2 text-gray-900">{buyer?.email || 'N/A'}</p>
                            </div>
                            <div className="py-4 flex items-center">
                                <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-700" />
                                <label className="block text-sm font-medium text-gray-700">Phone:</label>
                                <p className="mt-1 ml-2 text-gray-900">{buyer?.contactNumber || 'N/A'}</p>
                            </div>
                            <div className="py-4 flex items-center">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-700" />
                                <label className="block text-sm font-medium text-gray-700">Address:</label>
                                <p className="mt-1 ml-2 text-gray-900">{buyer?.address || 'N/A'}</p>
                            </div>
                            {buyer?.dob && (
                                <div className="py-4 flex items-center">
                                    <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-gray-700" />
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth:</label>
                                    <p className="mt-1 ml-2 text-gray-900">{buyer.dob}</p>
                                </div>
                            )}
                            {buyer?.occupation && (
                                <div className="py-4 flex items-center">
                                    <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-gray-700" />
                                    <label className="block text-sm font-medium text-gray-700">Occupation:</label>
                                    <p className="mt-1 ml-2 text-gray-900">{buyer.occupation}</p>
                                </div>
                            )}
                            <div className="pt-4">
                                <button
                                    onClick={handleEditProfile}
                                    className="inline-flex items-center px-4 py-2 bg-green-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                    Edit Profile
                                </button>
                                <Link
                                    to="/BuyerHomePage"
                                    className="inline-flex items-center ml-2 px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BuyerProfile;
