const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const makeRequest = async (endpoint, method = 'GET', body = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : null;
    if (!token) throw new Error('Authentication token not found.');

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const config = { method, headers, body: body ? JSON.stringify(body) : null };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'An error occurred.');
    return data;
};

export const getUserReviews = () => makeRequest('/api/reviews/user');
export const getReviewsByProduct = (productId) => makeRequest(`/api/reviews/product/${productId}`);
export const createReview = (reviewData) => makeRequest('/api/reviews', 'POST', reviewData);
export const updateReview = (reviewId, reviewData) => makeRequest(`/api/reviews/${reviewId}`, 'PUT', reviewData);
export const deleteReview = (reviewId) => makeRequest(`/api/reviews/${reviewId}`, 'DELETE');