const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const makeRequest = async (endpoint, method = 'GET', body = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : null;
    if (!token) throw new Error('Authentication token not found.');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const config = { method, headers, body: body ? JSON.stringify(body) : null };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'An error occurred.');
    return data;
};

// Profile
export const getUserProfile = () => makeRequest('/api/user/profile');
export const updateUserProfile = (profileData) => makeRequest('/api/user/profile', 'PUT', profileData);

// Addresses
export const getUserAddresses = () => makeRequest('/api/user/address');
export const addAddress = (addressData) => makeRequest('/api/user/address', 'POST', addressData);
export const updateAddress = (id, addressData) => makeRequest(`/api/user/address/${id}`, 'PUT', addressData);
export const deleteAddress = (id) => makeRequest(`/api/user/address/${id}`, 'DELETE');