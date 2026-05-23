const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get the token from localStorage
const getUserToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.token : null;
};

const makeRequest = async (endpoint, method = 'GET', body = null) => {
    const token = getUserToken();
    if (!token) throw new Error('Authentication token not found.');

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
        throw new Error(data.message || `Failed to perform ${method} on ${endpoint}`);
    }

    return data;
};

// ... (Wishlist functions are unchanged)
export const getWishlist = () => makeRequest('/api/buyer/wishlist');
export const addToWishlist = (productId) => makeRequest('/api/buyer/wishlist/add', 'POST', { productId });
export const removeFromWishlist = (productId) => makeRequest('/api/buyer/wishlist/remove', 'DELETE', { productId });

// Cart Functions
export const getCart = () => makeRequest('/api/buyer/cart');
export const addToCart = (productId, quantity = 1) => makeRequest('/api/buyer/cart/add', 'POST', { productId, quantity, mode: 'add' });
export const updateCartQuantity = (productId, quantity) => makeRequest('/api/buyer/cart/add', 'POST', { productId, quantity, mode: 'set' });
export const removeFromCart = (productId) => makeRequest('/api/buyer/cart/remove', 'DELETE', { productId });

// Order Function
export const getAddresses = () => makeRequest('/api/user/address');
export const addAddress = (addressData) => makeRequest('/api/user/address', 'POST', addressData);

// Order Function
export const createOrder = (orderData) => makeRequest('/api/buyer/orders/create', 'POST', orderData);
export const cancelOrder = (orderId) => makeRequest(`/api/buyer/orders/${orderId}/cancel`, 'PUT');
export const getOrders = () => makeRequest('/api/buyer/orders');
export const makePayment = (paymentData) => makeRequest('/api/buyer/payments/pay', 'POST', paymentData);
export const createRazorpayOrder = (orderData) => makeRequest('/api/buyer/orders/razorpay', 'POST', orderData);