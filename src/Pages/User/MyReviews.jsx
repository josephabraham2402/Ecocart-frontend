import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { getUserReviews, deleteReview } from '../../Service/Review';
import toast from 'react-hot-toast';

// Star display component
const StaticStarRating = ({ rating }) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg
                key={star}
                className={`w-5 h-5 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUserReviews = useCallback(async () => {
        try {
            const data = await getUserReviews();
            setReviews(data);
        } catch (error) {
            toast.error(error.message);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchUserReviews();
    }, [fetchUserReviews]);

    const proceedWithDelete = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            toast.success("Review deleted successfully.");
        } catch (error) {
            toast.error(error.message || "Failed to delete review.");
        }
    };

    const handleDelete = (reviewId) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Delete this review permanently?</p>
                <div className="flex gap-4">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {
                            proceedWithDelete(reviewId);
                            toast.dismiss(t.id);
                        }}
                    >
                        Delete
                    </button>
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    if (loading) return <div>Loading your reviews...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold mb-6">My Reviews</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review._id} className="border-b pb-4">
                                    <h2 className="text-xl font-semibold">{review.product.Title}</h2>
                                    <div className="flex items-center my-2">
                                        <StaticStarRating rating={review.rating} />
                                        <span className="ml-2 text-sm text-gray-500">
                                            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-4">{review.review}</p>
                                    <div className="flex space-x-4">
                                        <Link 
                                            to={`/product/${review.product._id}`}
                                            className="text-blue-600 font-semibold hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(review._id)}
                                            className="text-red-600 font-semibold hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">You have not written any reviews yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
}