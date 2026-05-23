const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadImages = async (formData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : null;
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
            // NOTE: Do not set Content-Type for multipart/form-data
            // The browser will set it automatically with the correct boundary
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to upload images.');
    }
    return data;
};