// src/Service/AdminService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- makeAdminRequest function (keep as before) ---
const makeAdminRequest = async (endpoint, method = 'GET', body = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token || user.role !== 'admin') {
        throw new Error('Unauthorized access or token not found.');
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
    };
    const config = { method, headers, body: body ? JSON.stringify(body) : null };
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Admin API Error (${response.status}): ${response.statusText}`);
        }
        return data;
    } catch (error) {
        console.error(`Admin API Request Error to ${endpoint}:`, error);
        throw error;
    }
};


// == Dashboard & Core Data ==
export const getAdminCounts = () => makeAdminRequest('/counts'); // Includes product count now
export const getAdminSalesAndRevenue = () => makeAdminRequest('/sales-revenue');
export const getAdminTopProducts = () => makeAdminRequest('/top-products');

// == Seller Management ==
export const getAdminSellers = () => makeAdminRequest('/sellers');
export const updateAdminSellerStatus = (sellerId, status) => makeAdminRequest('/sellers/status', 'PUT', { sellerId, status });

// == User Management ==
export const getAdminUsers = () => makeAdminRequest('/users'); // Uses the new route

// == Product Management ==
// (Keep getAdminProducts fetching /api/products as before)
export const getAdminProducts = async () => {
     const user = JSON.parse(localStorage.getItem('user'));
     if (!user || !user.token || user.role !== 'admin') {
         throw new Error('Unauthorized access or token not found.');
     }
     const headers = { 'Authorization': `Bearer ${user.token}` };
     const response = await fetch(`${API_BASE_URL}/api/products?limit=1000`, { headers });
     const data = await response.json();
     if (!response.ok) {
         throw new Error(data.message || 'Failed to fetch products for admin.');
     }
     return data;
};

export const deleteAdminUser = (userId) => makeAdminRequest(`/users/${userId}`, 'DELETE');
export const deleteAdminSeller = (sellerId) => makeAdminRequest(`/sellers/${sellerId}`, 'DELETE');
export const getAdminAverageSellerRating = () => makeAdminRequest('/sellers/average-rating');

export const getAdminSalesOverTime = (period = 'month') => makeAdminRequest(`/analytics/sales-over-time?period=${period}`);
export const getAdminSalesByCategory = () => makeAdminRequest('/analytics/sales-by-category');
// --- ✅ Ensure these exist ---
export const getAdminEmissionsOverTime = (period = 'month') => makeAdminRequest(`/analytics/emissions-over-time?period=${period}`);
export const getAdminEmissionsByCategory = () => makeAdminRequest('/analytics/emissions-by-category');

// Updated function for Reports Page Data
export const getAdminReportData = async (period = 'month') => { // Accept period if needed
    // Fetch data concurrently
    const [
        salesRevData,
        salesTimeData,
        salesCategoryData,
        emissionsTimeData,
        emissionsCategoryData
    ] = await Promise.all([
        getAdminSalesAndRevenue(),
        getAdminSalesOverTime(period),   // Pass period
        getAdminSalesByCategory(),
        getAdminEmissionsOverTime(period), // Pass period
        getAdminEmissionsByCategory()
    ]).catch(err => {
        // If Promise.all fails (e.g., connection refused), throw the error
        console.error("Error fetching report data:", err);
        throw err; // Propagate the error to the component
    });
    // Return combined data
    return {
        salesRevData,
        salesTimeData,
        salesCategoryData,
        emissionsTimeData,
        emissionsCategoryData
    };
};