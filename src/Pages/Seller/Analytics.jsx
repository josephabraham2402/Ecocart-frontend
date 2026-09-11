import React, { useState, useEffect, useCallback } from 'react';
import { getSellerAnalytics } from '../../Service/Seller';
import Pagination from '../../Components/Pagination';
import { LoadingScreen } from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function SellerAnalytics() {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSellerAnalytics({ page: currentPage, limit: 10 });
            setAnalytics(data.analytics || []);
            setTotalProducts(data.totalProducts || 0);
        } catch (error) {
            toast.error(error.message || "Failed to fetch analytics.");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <LoadingScreen 
                message="Loading Analytics..." 
                subMessage="Computing emissions, sales, and sustainability scores..." 
                fullScreen={false} 
                className="py-24"
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Product Analytics</h2>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Product</th>
                            <th className="p-4">Units Sold</th>
                            <th className="p-4">Total EcoPoints</th>
                            <th className="p-4">Total CO2 Emission</th>
                            <th className="p-4">Avg. Rating</th>
                            <th className="p-4">Reviews</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics.map(product => (
                            <tr key={product._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-semibold">{product.Title}</td>
                                <td className="p-4">{product.unitsSold || 0}</td>
                                <td className="p-4">{(product.totalEcoPoints || 0)} EP</td>
                                <td className="p-4">{(product.totalCarbon || 0).toFixed(2)}g</td>
                                <td className="p-4">{(product.rating?.average || 0).toFixed(1)} / 5</td>
                                <td className="p-4">{product.rating?.count || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {analytics.length === 0 && <p className="text-center p-4">No sales data available yet.</p>}
                
                <Pagination 
                    productsPerPage={10}
                    totalProducts={totalProducts}
                    paginate={(page) => setCurrentPage(page)}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
}