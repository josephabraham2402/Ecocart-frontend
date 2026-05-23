import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createReview, updateReview } from '../Service/Review';

const StarRating = ({ rating, setRating }) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg
                key={star}
                onClick={() => setRating(star)}
                className={`w-6 h-6 cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

const blocklist = ["damn", "hell", "crap", "idiot", "stupid", "dumb", "fool"];

const containsBlockedWords = (text) => {
    if (!text) return false;
    const lowerCaseText = text.toLowerCase();
    return blocklist.some(word => lowerCaseText.includes(word));
};

export default function ReviewForm({ productId, existingReview, onReviewSubmitted, onCancelEdit }) {
    const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
    const [reviewText, setReviewText] = useState(existingReview ? existingReview.review : '');
    const isEditing = !!existingReview;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0 || !reviewText) {
            return toast.error("Please provide a rating and a review.");
        }
        if (containsBlockedWords(reviewText)) {
            return toast.error("Your review contains inappropriate language.");
        }

        try {
            if (isEditing) {
                await updateReview(existingReview._id, { rating, review: reviewText });
                toast.success("Review updated successfully!");
            } else {
                await createReview({ productId, rating, review: reviewText });
                toast.success("Thank you for your review!");
            }
            onReviewSubmitted();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-lg mb-2">{isEditing ? "Edit Your Review" : "Write a Review"}</h3>
            <form onSubmit={handleSubmit}>
                <StarRating rating={rating} setRating={setRating} />
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about the product..."
                    className="w-full p-2 border rounded mt-4"
                    rows="4"
                />
                <div className="flex items-center gap-4 mt-4">
                    <button type="submit" className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-700">
                        {isEditing ? "Update Review" : "Submit Review"}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={onCancelEdit} className="text-gray-600 hover:underline">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}