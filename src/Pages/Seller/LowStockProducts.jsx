import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerProducts } from '../../Service/Seller';
import toast from 'react-hot-toast';

const getCarbonScore = (footprint) => {
    if (footprint < 1) return 'A+';
    if (footprint < 2) return 'A';
    if (footprint < 5) return 'B';
    if (footprint < 10) return 'C';
    return 'D';
};

export default function LowStockProducts() {
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSellerProducts({ limit: 1000 });
            const productsList = data.products || [];
            const lowStock = productsList.filter(p => p.Quantity <= 5);
            setLowStockProducts(lowStock);
        } catch (error) {
            toast.error(error.message || "Failed to fetch products.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (loading) return <div>Loading low stock products...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Low Stock Products</h2>
                <button 
                    onClick={() => navigate('/seller/products')} 
                    className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700"
                >
                    Go to All Products to Update
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Product ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Carbon Score</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockProducts.map(product => (
                            <tr key={product._id} className="border-b hover:bg-gray-50 bg-yellow-50">
                                <td className="p-4 text-gray-500">#{product._id.slice(-5)}</td>
                                <td className="p-4 font-semibold">{product.Title}</td>
                                <td className="p-4 font-bold text-red-600">{product.Quantity}</td>
                                <td className="p-4">{getCarbonScore(product.CarbonFootPrint)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {product.Status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {lowStockProducts.length === 0 && <p className="text-center p-4">You have no products with low stock.</p>}
            </div>
        </div>
    );
}