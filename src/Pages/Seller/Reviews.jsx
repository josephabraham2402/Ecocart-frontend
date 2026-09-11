import React, { useState, useEffect, useCallback } from 'react';
import { getSellerReviews } from '../../Service/Seller';
import Pagination from '../../Components/Pagination';
import { LoadingScreen } from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';

const StaticStarRating = ({ rating }) => (
    <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

export default function SellerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSellerReviews({ page: currentPage, limit: 10 });
            setReviews(data.reviews || []);
            setTotalReviews(data.totalReviews || 0);
        } catch (error) {
            toast.error(error.message || "Failed to fetch reviews.");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    if (loading) {
        return (
            <LoadingScreen 
                message="Loading Reviews..." 
                subMessage="Fetching customer ratings and product feedback..." 
                fullScreen={false} 
                className="py-24"
            />
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Product Reviews</h2>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review._id} className="border-b pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{review.product.Title}</h3>
                                    <p className="text-sm text-gray-500">by {review.user.email}</p>
                                </div>
                                <StaticStarRating rating={review.rating} />
                            </div>
                            <p className="mt-2 text-gray-700">{review.review}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center p-4">You have no reviews yet.</p>
                )}
                
                <Pagination 
                    productsPerPage={10}
                    totalProducts={totalReviews}
                    paginate={(page) => setCurrentPage(page)}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
}