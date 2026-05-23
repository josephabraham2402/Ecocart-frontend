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
export const getSellerOrders = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/seller/orders${query ? `?${query}` : ''}`);
};

export const getDashboardStats = () => makeRequest('/api/seller/dashboard-stats');

export const getSellerProducts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/seller${query ? `?${query}` : ''}`);
};
export const createProduct = (productData) => makeRequest('/api/seller', 'POST', productData);
export const updateProduct = (id, productData) => makeRequest(`/api/seller/${id}`, 'PUT', productData);
export const deleteProduct = (id) => makeRequest(`/api/seller/${id}`, 'DELETE');
export const getSellerAnalytics = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/seller/analytics${query ? `?${query}` : ''}`);
};
export const updateOrderStatus = (orderId, status) => makeRequest(`/api/seller/orders/${orderId}`, 'PUT', { status });
export const getSellerReviews = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/seller/reviews${query ? `?${query}` : ''}`);
};
export const updateProductStatus = (orderId, productId, status) => makeRequest(`/api/seller/orders/${orderId}/products/${productId}`, 'PUT', { status });

export const getWarehouses = () => makeRequest('/api/seller/warehouses');
export const addWarehouse = (warehouseData) => makeRequest('/api/seller/warehouses', 'POST', warehouseData);
export const updateWarehouse = (id, warehouseData) => makeRequest(`/api/seller/warehouses/${id}`, 'PUT', warehouseData);
export const deleteWarehouse = (id) => makeRequest(`/api/seller/warehouses/${id}`, 'DELETE');