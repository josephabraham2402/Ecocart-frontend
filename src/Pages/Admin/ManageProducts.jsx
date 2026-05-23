import React, { useState, useEffect, useCallback } from 'react';
import { getAdminProducts } from '../../Service/AdminService';
import toast from 'react-hot-toast';

const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>;

const EcoFriendlyPill = ({ isEco }) => {
    const colorClasses = isEco ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const text = isEco ? 'True' : 'False';
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            {text}
        </span>
    );
};

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminProducts();
            setProducts(data || []);
        } catch (error) {
            toast.error(error.message || "Failed to fetch products.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = products.filter(product =>
        product.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.Category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-10">Loading Products... <span role="img" aria-label="loading">⏳</span></div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h2>
            <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
                <SearchIcon />
                <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full ml-3 p-1 border-0 focus:outline-none focus:ring-0 text-sm"
                />
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Seller id</th>
                            <th className="px-6 py-3">Product Name</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3 text-right">Price</th>
                            <th className="px-6 py-3 text-right">Stock</th>
                            <th className="px-6 py-3 text-center">Eco-Friendly</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                            <tr key={product._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{product.SellerId}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.Title}</th>
                                <td className="px-6 py-4">{product.Category}</td>
                                <td className="px-6 py-4 text-right">Rs.{product.Price.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">{product.Quantity}</td>
                                <td className="px-6 py-4 text-center">
                                    <EcoFriendlyPill isEco={(product.EcoPoints || 0) > 0 || (product.CarbonFootPrint !== undefined && product.CarbonFootPrint < 10)} />
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-6 text-gray-500">
                                    {products.length === 0 ? "No products found." : "No products match your search."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}