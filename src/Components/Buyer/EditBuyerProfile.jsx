import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faUserEdit, 
  faMapMarkerAlt, 
  faPhone, 
  faLandmark,
  faUniversity,
  faCreditCard,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditUserProfile() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [user, setUser] = useState({ 
    name: '', 
    email: '', 
    contactNumber: '', 
    address: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [updatedUser, setUpdatedUser] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: ''
    }
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: ''
  });

  useEffect(() => {
    const email = localStorage.getItem("email");
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!email || !userRole) {
      setError("Email or role not found in localStorage. Please sign in.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/${userRole}/${email}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setUser(data);
        setUpdatedUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.contactNumber || '',
          address: data.address || '',
          bankDetails: data.bankDetails || {
            bankName: '',
            accountNumber: '',
            accountHolderName: '',
            ifscCode: ''
          }
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!updatedUser.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!updatedUser.phone.trim()) {
      errors.phone = 'Phone is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(updatedUser.phone)) {
      errors.phone = 'Phone must be 10 digits';
      isValid = false;
    }

    if (!updatedUser.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }

    // Bank details validation (optional fields but validate format if provided)
    if (updatedUser.bankDetails.bankName && !updatedUser.bankDetails.bankName.trim()) {
      errors.bankName = 'Bank name is required if provided';
      isValid = false;
    }

    if (updatedUser.bankDetails.accountNumber) {
      if (!updatedUser.bankDetails.accountNumber.trim()) {
        errors.accountNumber = 'Account number is required if provided';
        isValid = false;
      } else if (!/^\d{9,18}$/.test(updatedUser.bankDetails.accountNumber)) {
        errors.accountNumber = 'Account number must be 9-18 digits';
        isValid = false;
      }
    }

    if (updatedUser.bankDetails.accountHolderName && !updatedUser.bankDetails.accountHolderName.trim()) {
      errors.accountHolderName = 'Account holder name is required if provided';
      isValid = false;
    }

    if (updatedUser.bankDetails.ifscCode) {
      if (!updatedUser.bankDetails.ifscCode.trim()) {
        errors.ifscCode = 'IFSC code is required if provided';
        isValid = false;
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(updatedUser.bankDetails.ifscCode)) {
        errors.ifscCode = 'IFSC code must be in format: ABCD0123456';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleBack = () => {
    navigate(`/${role}/profile`);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setFormErrors({
      name: '',
      phone: '',
      address: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bank.')) {
      const bankField = name.split('.')[1];
      setUpdatedUser({
        ...updatedUser,
        bankDetails: {
          ...updatedUser.bankDetails,
          [bankField]: value
        }
      });
    } else {
      setUpdatedUser({ ...updatedUser, [name]: value });
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const email = localStorage.getItem("email");
    fetch(`http://localhost:8080/api/${role}/${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updatedUser.name,
        email: updatedUser.email,
        contactNumber: updatedUser.phone,
        address: updatedUser.address,
        bankDetails: updatedUser.bankDetails
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        toast.success(`${updatedUser.name} Profile updated successfully!`, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        navigate(`/${role}/profile`);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        toast.error("Failed to update profile. Please try again.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 p-4">
        <p className="text-lg font-medium mb-4">Error: {error}</p>
        <button 
          onClick={handleBack}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12 px-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack} 
              className="flex items-center hover:text-green-100 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back
            </button>
            <h2 className="text-xl font-bold">
              {role === 'farmer' ? 'Farmer Profile' : 'Buyer Profile'}
            </h2>

            {!editMode && (
              <button 
                onClick={handleEditToggle}
                className="flex items-center hover:text-green-100 transition-colors"
              >
                <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {editMode ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Personal Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={updatedUser.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={updatedUser.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={updatedUser.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={updatedUser.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                    rows="3"
                    placeholder="Enter your full address"
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex items-center">
                  <FontAwesomeIcon icon={faLandmark} className="mr-2 text-green-600" />
                  Bank Details
                </h3>
                
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FontAwesomeIcon icon={faUniversity} className="mr-2 text-gray-500" />
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bank.bankName"
                    value={updatedUser.bankDetails.bankName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter bank name"
                  />
                  {formErrors.bankName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.bankName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-500" />
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="bank.accountNumber"
                    value={updatedUser.bankDetails.accountNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter account number"
                  />
                  {formErrors.accountNumber && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.accountNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FontAwesomeIcon icon={faUserEdit} className="mr-2 text-gray-500" />
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    id="accountHolderName"
                    name="bank.accountHolderName"
                    value={updatedUser.bankDetails.accountHolderName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.accountHolderName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter account holder name"
                  />
                  {formErrors.accountHolderName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.accountHolderName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" />
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    id="ifscCode"
                    name="bank.ifscCode"
                    value={updatedUser.bankDetails.ifscCode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.ifscCode ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter IFSC code (e.g., ABCD0123456)"
                  />
                  {formErrors.ifscCode && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.ifscCode}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setEditMode(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Personal Information Display */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Personal Information</h3>
                
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">{user.name || 'Not provided'}</p>
                </div>
                
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-lg font-medium text-gray-900">{user.email || 'Not provided'}</p>
                </div>
                
                <div className="pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  </div>
                  <p className="text-lg font-medium text-gray-900 ml-6">{user.contactNumber || 'Not provided'}</p>
                </div>
                
                <div className="pb-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Address</p>
                  </div>
                  <p className="text-lg font-medium text-gray-900 ml-6 whitespace-pre-line">
                    {user.address || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Bank Details Display */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex items-center">
                  <FontAwesomeIcon icon={faLandmark} className="mr-2 text-green-600" />
                  Bank Details
                </h3>
                
                {user.bankDetails ? (
                  <>
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUniversity} className="mr-2 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Bank Name</p>
                      </div>
                      <p className="text-lg font-medium text-gray-900 ml-6">{user.bankDetails.bankName || 'Not provided'}</p>
                    </div>
                    
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                      </div>
                      <p className="text-lg font-medium text-gray-900 ml-6">{user.bankDetails.accountNumber || 'Not provided'}</p>
                    </div>
                    
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUserEdit} className="mr-2 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Account Holder</p>
                      </div>
                      <p className="text-lg font-medium text-gray-900 ml-6">{user.bankDetails.accountHolderName || 'Not provided'}</p>
                    </div>
                    
                    <div className="pb-4">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                      </div>
                      <p className="text-lg font-medium text-gray-900 ml-6">{user.bankDetails.ifscCode || 'Not provided'}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm py-4">No bank details added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default EditUserProfile;