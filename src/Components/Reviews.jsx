import React, { useState, useEffect, useCallback } from 'react';
import { getReviewsByProduct, deleteReview } from '../Service/Review';
import toast from 'react-hot-toast';
import ReviewForm from './ReviewForm';

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

export default function Reviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const userId = JSON.parse(localStorage.getItem('user'))?._id;

    const fetchReviews = useCallback(async () => {
        try {
            const productReviews = await getReviewsByProduct(productId);
            const existingUserReview = productReviews.find(r => r.user._id === userId);
            setUserReview(existingUserReview || null);
            setReviews(productReviews);
            setEditingReviewId(null);
        } catch (error) {
            console.error("Could not fetch reviews:", error);
        }
    }, [productId, userId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const proceedWithDelete = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            toast.success("Review deleted.");
            fetchReviews();
        } catch (error) {
            toast.error(error.message || "Failed to delete review.");
        }
    };

    const handleDeleteClick = (reviewId) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Delete this review?</p>
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

    return (
        <div className="mt-8 pt-6 border-t">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            
            {!userReview && (
                <ReviewForm 
                    productId={productId} 
                    onReviewSubmitted={fetchReviews} 
                />
            )}
            
            <div className="space-y-6">
                {reviews.length > 0 ? reviews.map(review => {
                    if (editingReviewId === review._id) {
                        return (
                            <ReviewForm 
                                key={review._id}
                                productId={productId}
                                existingReview={review}
                                onReviewSubmitted={fetchReviews}
                                onCancelEdit={() => setEditingReviewId(null)}
                            />
                        );
                    }

                    return (
                        <div key={review._id} className="border-b pb-4">
                            <div className="flex items-center mb-2">
                                <StaticStarRating rating={review.rating} />
                                <p className="ml-4 font-bold">{review.user.email}</p>
                            </div>
                            <p className="text-gray-700">{review.review}</p>
                            
                            {userId === review.user._id && (
                                <div className="flex space-x-4 mt-2">
                                    <button onClick={() => setEditingReviewId(review._id)} className="text-sm text-blue-600 font-semibold hover:underline">Edit</button>
                                    <button onClick={() => handleDeleteClick(review._id)} className="text-sm text-red-600 font-semibold hover:underline">Delete</button>
                                </div>
                            )}
                        </div>
                    )
                }) : (!userReview && <p>No reviews yet. Be the first to write one!</p>)}
            </div>
        </div>
    );
}