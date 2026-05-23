const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Reusable helper function to make authenticated API requests
const makeRequest = async (endpoint, method = 'GET', body = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : null;

    if (!token) {
        // Throws an error that can be caught by the component
        throw new Error('You are not logged in. Please log in to continue.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `API request to ${endpoint} failed.`);
    }

    return data;
};

/**
 * Fetches all products from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of products.
 */
export const getAllProducts = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
    return makeRequest(endpoint);
};

/**
 * Fetches a single product by its ID from the backend.
 * @param {string} productId - The ID of the product to fetch.
 * @returns {Promise<Object>} A promise that resolves to the product object.
 */
export const getProductById = (productId) => {
    return makeRequest(`/api/products/${productId}`);
};