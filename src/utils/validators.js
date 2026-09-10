export const validateBuyerForm = (formData) => {
    const errors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
        errors.name = 'Name is required';
        isValid = false;
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.name)) {
        errors.name = 'Name should be 2-50 alphabetic characters';
        isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
        errors.email = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
    }

    // Password validation
    if (!formData.password) {
        errors.password = 'Password is required';
        isValid = false;
    } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        isValid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
        isValid = false;
    } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
        isValid = false;
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one number';
        isValid = false;
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one special character';
        isValid = false;
    }

    // Shipping Address validation
    if (!formData.shippingAddress.trim()) {
        errors.shippingAddress = 'Shipping address is required';
        isValid = false;
    } else if (formData.shippingAddress.trim().length < 10) {
        errors.shippingAddress = 'Address should be at least 10 characters';
        isValid = false;
    } else if (!/[a-zA-Z]/.test(formData.shippingAddress) || !/[0-9]/.test(formData.shippingAddress)) {
        errors.shippingAddress = 'Address should contain both letters and numbers';
        isValid = false;
    }

    // Contact Number validation
    if (!formData.contactNumber.trim()) {
        errors.contactNumber = 'Contact number is required';
        isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
        errors.contactNumber = 'Please enter a valid 10-digit number';
        isValid = false;
    }

    return { isValid, errors };
};

export const validateFarmerForm = (formData) => {
    const errors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
        errors.name = 'Name is required';
        isValid = false;
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.name)) {
        errors.name = 'Name should be 2-50 alphabetic characters';
        isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
        errors.email = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
    }

    // Password validation
    if (!formData.password) {
        errors.password = 'Password is required';
        isValid = false;
    } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        isValid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
        isValid = false;
    } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
        isValid = false;
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one number';
        isValid = false;
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one special character';
        isValid = false;
    }

    // Location validation
    if (!formData.location.trim()) {
        errors.location = 'Location is required';
        isValid = false;
    } else if (formData.location.trim().length < 5) {
        errors.location = 'Location should be at least 5 characters';
        isValid = false;
    } else if (!/[a-zA-Z]/.test(formData.location)) {
        errors.location = 'Location should contain letters';
        isValid = false;
    }

    // Contact Number validation
    if (!formData.contactNumber.trim()) {
        errors.contactNumber = 'Contact number is required';
        isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
        errors.contactNumber = 'Please enter a valid 10-digit number';
        isValid = false;
    }

    return { isValid, errors };
};

export const validateLoginForm = (formData) => {
    const errors = {};
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
        errors.email = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
    }

    // Password validation
    if (!formData.password) {
        errors.password = 'Password is required';
        isValid = false;
    } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        isValid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
        isValid = false;
    } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
        isValid = false;
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one number';
        isValid = false;
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one special character';
        isValid = false;
    }

    return { isValid, errors };
};