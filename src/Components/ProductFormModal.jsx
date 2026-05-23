import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { uploadImages } from '../Service/UploadService';
import { getWarehouses } from '../Service/Seller'; // Import warehouse service

const FormField = ({ label, children, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const categories = [
    "clothing", "shoes", "accessories", "jewelry", "electronics", "computer",
    "mobile", "appliances", "furniture", "home", "kitchen", "garden",
    "cosmetics", "skincare", "sports", "books", "stationary", "toys",
    "pet", "health", "other", "food", "groceries"
];

const defaultProductState = {
    Title: '', Price: '', Images: [], Category: 'clothing',
    Description: '', Weight: '', Height: '', Width: '',
    Quantity: '', Keywords: '', Status: 'Active', Size: '', Color: '', warehouse: ''
};

export default function ProductFormModal({ isOpen, onClose, onSave, initialData }) {
    const [product, setProduct] = useState(defaultProductState);
    const [errors, setErrors] = useState({});
    const [imageFiles, setImageFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [warehouses, setWarehouses] = useState([]); // State for warehouses

    // Fetch warehouses when the modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchWarehouses = async () => {
                try {
                    const data = await getWarehouses();
                    setWarehouses(data);
                } catch (error) {
                    console.log(error);
                    toast.error("Could not load your warehouses.");
                }
            };
            fetchWarehouses();

            if (initialData) {
                setProduct({
                    ...defaultProductState,
                    ...initialData,
                    warehouse: initialData.warehouse || '', // Set initial warehouse
                    Keywords: Array.isArray(initialData.Keywords) ? initialData.Keywords.join(', ') : '',
                });
            } else {
                setProduct(defaultProductState);
            }
            setImageFiles([]);
            setErrors({});
        }
    }, [initialData, isOpen]);

    const validateField = (name, value) => {
        let error = '';
        const requiredFields = ['Title', 'Price', 'Description', 'Weight', 'Height', 'Width', 'Quantity', 'warehouse'];
        if (requiredFields.includes(name) && !value) {
            error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
        } else if (['Price', 'Weight', 'Height', 'Width'].includes(name) && Number(value) <= 0) {
            error = `${name} must be greater than 0.`;
        } else if (name === 'Quantity' && Number(value) < 0) {
            error = 'Quantity cannot be negative.';
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 5) {
            toast.error("You can only upload a maximum of 5 images.");
            e.target.value = null;
            return;
        }
        setImageFiles(Array.from(e.target.files));
    };
    
    const handleRemoveImage = (indexToRemove) => {
        setProduct(prev => ({
            ...prev,
            Images: prev.Images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(defaultProductState).forEach(key => {
            if (['Title', 'Price', 'Description', 'Weight', 'Height', 'Width', 'Quantity', 'warehouse'].includes(key)) {
                const error = validateField(key, product[key]);
                if (error) newErrors[key] = error;
            }
        });

        if (product.Images.length === 0 && imageFiles.length === 0) {
            newErrors.Images = "At least one image is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the validation errors.');
            return;
        }

        setIsUploading(true);
        try {
            let finalImages = [...product.Images];
            if (imageFiles.length > 0) {
                const formData = new FormData();
                imageFiles.forEach(file => formData.append('images', file));
                const uploadedImageUrls = await uploadImages(formData);
                finalImages = uploadedImageUrls;
            }

            const productToSave = {
                ...product,
                Images: finalImages,
                Price: Number(product.Price),
                Quantity: Number(product.Quantity),
                Weight: Number(product.Weight),
                Height: Number(product.Height),
                Width: Number(product.Width),
                Keywords: product.Keywords.split(',').map(k => k.trim()),
            };
            onSave(productToSave);
        } catch (error) {
            toast.error(error.message || "Failed to save product.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    
                    <FormField label="Product Images (Max 5)" error={errors.Images}>
                        <input type="file" onChange={handleFileChange} multiple accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {product.Images.map((img, index) => (
                                <div key={index} className="relative">
                                    <img src={img.src} alt={img.alt || 'Product image'} className="w-20 h-20 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs"
                                        aria-label="Remove image"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                             {imageFiles.map((file, index) => (
                                <img key={index} src={URL.createObjectURL(file)} alt="New preview" className="w-20 h-20 object-cover rounded-md" />
                            ))}
                        </div>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Product Title" error={errors.Title}>
                            <input name="Title" value={product.Title} onChange={handleChange} className="w-full p-2 border rounded" />
                        </FormField>
                        <FormField label="Price (Rs.)" error={errors.Price}>
                            <input name="Price" type="number" value={product.Price} onChange={handleChange} className="w-full p-2 border rounded" />
                        </FormField>
                    </div>

                    <FormField label="Description" error={errors.Description}>
                        <textarea name="Description" value={product.Description} onChange={handleChange} rows="3" className="w-full p-2 border rounded" />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Category">
                            <select name="Category" value={product.Category} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Stock Quantity" error={errors.Quantity}>
                            <input name="Quantity" type="number" value={product.Quantity} onChange={handleChange} className="w-full p-2 border rounded" />
                        </FormField>
                    </div>

                    {/* --- WAREHOUSE SELECTION --- */}
                    <FormField label="Warehouse" error={errors.warehouse}>
                        <select name="warehouse" value={product.warehouse} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                            <option value="">Select a Warehouse</option>
                            {warehouses.map(w => (
                                <option key={w._id} value={w._id}>
                                    {w.name} - {w.city}
                                </option>
                            ))}
                        </select>
                    </FormField>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Weight (KG)" error={errors.Weight}>
                            <input name="Weight" type="number" step="0.01" value={product.Weight} onChange={handleChange} className="w-full p-2 border rounded" />
                        </FormField>
                        <FormField label="Height (cm)" error={errors.Height}>
                            <input name="Height" type="number" step="0.01" value={product.Height} onChange={handleChange} className="w-full p-2 border rounded" />
                        </FormField>
                         <FormField label="Width (cm)" error={errors.Width}>
                            <input name="Width" type="number" step="0.01" value={product.Width} onChange={handleChange} className="w-full p-2 border rounded" />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Size (e.g., M, L, XL)</label>
                            <input name="Size" value={product.Size} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Color (e.g., Red)</label>
                             <input name="Color" value={product.Color} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                    </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
                        <input name="Keywords" value={product.Keywords} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="Status" value={product.Status} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isUploading} className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-700 disabled:bg-teal-400">
                            {isUploading ? 'Uploading...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}