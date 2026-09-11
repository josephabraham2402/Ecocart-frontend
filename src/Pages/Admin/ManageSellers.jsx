// src/Pages/Admin/ManageSellers.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import the new service functions
import { getAdminSellers, updateAdminSellerStatus, deleteAdminSeller, getAdminAverageSellerRating } from '../../Service/AdminService';
import { LoadingScreen } from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';

// Updated StatCard: Removed 'change' prop entirely
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow text-center border border-gray-100 min-h-[100px] flex flex-col justify-center">
        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <p className={`text-3xl font-bold mt-1 text-gray-800 ${value === null ? 'animate-pulse' : ''}`}>
             {/* Display N/A if value is null */}
             {value !== null ? value : '...'}
        </p>
    </div>
);


const getStatusPill = (status) => {
    let colorClasses = 'bg-gray-100 text-gray-800';
    if (status === 'approved') colorClasses = 'bg-green-100 text-green-800';
    if (status === 'pending') colorClasses = 'bg-yellow-100 text-yellow-800';
    if (status === 'denied') colorClasses = 'bg-red-100 text-red-800';
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};


export default function ManageSellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Updated stats state to include avgRating
    const [stats, setStats] = useState({
        total: null,
        active: null,
        avgRating: null, // Initialize avgRating to null
    });

    const fetchSellersAndStats = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch sellers list and average rating concurrently
            const [sellerData, ratingData] = await Promise.all([
                getAdminSellers(), // Fetches all sellers
                getAdminAverageSellerRating() // Fetches { averageRating, ratedSellersCount }
            ]);

            const fetchedSellers = sellerData || [];
            setSellers(fetchedSellers);

            // Calculate stats based on fetched data
            setStats({
                total: fetchedSellers.length,
                active: fetchedSellers.filter(s => s.status === 'approved').length,
                // Use the averageRating from the new endpoint, format to 1 decimal place
                avgRating: ratingData?.averageRating !== undefined ? parseFloat(ratingData.averageRating.toFixed(1)) : null
            });
             console.log("Fetched Sellers:", fetchedSellers);
             console.log("Fetched Rating Data:", ratingData);

        } catch (error) {
            toast.error(error.message || "Failed to fetch seller data.");
            setSellers([]);
             setStats({ total: 0, active: 0, avgRating: null }); // Reset stats on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSellersAndStats(); // Call the combined fetch function
    }, [fetchSellersAndStats]);

    // Handle Status Update (Approve, Deny) - Keep as before
    const handleStatusUpdate = (sellerId, sellerEmail, newStatus) => {
         toast((t) => (
            <div className="flex flex-col items-center gap-2 px-4 py-2">
                <p className="font-semibold text-center">Set status for <br/> <span className='font-normal'>{sellerEmail}</span> <br/> to "{newStatus}"?</p>
                <div className="flex gap-4 mt-2">
                    <button
                        className={`font-bold py-2 px-4 rounded text-white ${
                            newStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                            'bg-red-500 hover:bg-red-600' // Deny color
                        }`}
                        onClick={async () => {
                            try {
                                await updateAdminSellerStatus(sellerId, newStatus);
                                toast.success(`Seller status updated to ${newStatus}.`);
                                fetchSellersAndStats(); // Refresh list and stats
                            } catch (error) {
                                toast.error(error.message || "Failed to update status.");
                            }
                            toast.dismiss(t.id);
                        }}
                    >
                        Confirm
                    </button>
                    <button
                        className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    // Handle Seller Deletion - Keep as before
     const handleDeleteSeller = (sellerId, sellerEmail) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2 p-4">
                <p className="font-semibold text-center">Delete seller <span className='font-normal'>{sellerEmail}</span>?</p>
                <p className="text-sm text-red-600 text-center">Associated products might also be affected. This cannot be undone.</p>
                <div className="flex gap-4 mt-3">
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        onClick={async () => {
                            try {
                                await deleteAdminSeller(sellerId);
                                toast.success(`Seller ${sellerEmail} deleted.`);
                                fetchSellersAndStats(); // Refresh list and stats
                            } catch (error) {
                                toast.error(error.message || "Failed to delete seller.");
                            }
                            toast.dismiss(t.id);
                        }}
                    >
                        Confirm Delete
                    </button>
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition-colors"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 8000 });
    };


    if (loading) {
        return (
            <LoadingScreen 
                message="Loading Sellers..." 
                subMessage="Fetching seller verification requests and store performance..." 
                fullScreen={false} 
                className="py-24"
            />
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Seller Management</h2>

             {/* Stat Cards - Updated to use fetched avgRating */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Sellers" value={stats.total?.toLocaleString() ?? null} />
                <StatCard title="Active Sellers" value={stats.active?.toLocaleString() ?? null} />
                {/* Display fetched average rating */}
                <StatCard title="Average Seller Rating" value={stats.avgRating !== null ? stats.avgRating.toFixed(1) : 'N/A'} />
             </div>


            {/* Seller Table */}
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
                {/* Optional Search Bar */}
                 <div className="p-4 border-b">
                     {/* Add Search Input if desired */}
                 </div>

                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Store Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellers.map(seller => (
                            <tr key={seller._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{seller.email}</td>
                                <td className="px-6 py-4">{seller.storeName || 'Not Set'}</td>
                                <td className="px-6 py-4">{getStatusPill(seller.status)}</td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    {/* Approve Button (Only if pending) */}
                                    {seller.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(seller._id, seller.email, 'approved')}
                                            className="text-xs bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded transition-colors duration-150"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {/* Deny Button (Only if pending) */}
                                    {seller.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(seller._id, seller.email, 'denied')}
                                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded transition-colors duration-150"
                                        >
                                            Deny
                                        </button>
                                    )}
                                     {/* Delete Button (Always show) */}
                                     <button
                                        onClick={() => handleDeleteSeller(seller._id, seller.email)}
                                        className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition-colors duration-150"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sellers.length === 0 && <p className="text-center p-6 text-gray-500">No sellers found.</p>}
            </div>
        </div>
    );
}