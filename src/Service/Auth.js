const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
    }

    return data;
};

export const registerUser = async (userData) => {
    // The backend expects confirmpassword, not name.
    const payload = {
        email: userData.email,
        role: userData.role,
        password: userData.password,
        confirmpassword: userData.confirmPassword // Changed to match backend
    };

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
    }

    return data;
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link.');
    }
    return data.message;
};

export const resetPassword = async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
    }
    return data.message;
};