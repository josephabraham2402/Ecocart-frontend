import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HeartIcon, FilledHeartIcon } from './Images';
import { LoadingSpinner } from './LoadingSpinner';
import { addToWishlist, removeFromWishlist, addToCart } from '../Service/Buyer';

export default function ProductCard({ product, wishlistItems = [], refreshWishlist }) {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [isWishlisting, setIsWishlisting] = useState(false);
    const isInWishlist = wishlistItems.some(item => item.product?._id === product._id);
    const isOutOfStock = product.Quantity <= 0;

    const handleToggleWishlist = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isWishlisting) return;
        setIsWishlisting(true);
        try {
            if (isInWishlist) {
                await removeFromWishlist(product._id);
                toast.success(`${product.Title} removed from wishlist!`);
            } else {
                await addToWishlist(product._id);
                toast.success(`${product.Title} added to wishlist!`);
            }
            if (refreshWishlist) refreshWishlist();
        } catch (error) {
            toast.error(error.message || "Could not update wishlist.");
        } finally {
            setIsWishlisting(false);
        }
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isOutOfStock || isAdding) return;
        setIsAdding(true);
        try {
            await addToCart(product._id);
            toast.success(`${product.Title} added to cart!`);
        } catch (error) {
            toast.error(error.message || "Could not add to cart.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isOutOfStock || isBuying) return;
        setIsBuying(true);
        try {
            const updatedCart = await addToCart(product._id);
            navigate('/cart', { state: { initialCart: updatedCart } });
        } catch (error) {
            toast.error(error.message || "Could not process purchase.");
            setIsBuying(false);
        }
    };

    const imageUrl = 
        product.Images && Array.isArray(product.Images) && product.Images.length > 0 && product.Images[0]?.src
        ? product.Images[0].src 
        : 'https://via.placeholder.com/300';

    return (
        <Link to={`/product/${product._id}`} className={`block group ${isOutOfStock ? 'opacity-60' : ''}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform group-hover:-translate-y-1 transition-all duration-300">
                <div className="relative">
                    <img src={imageUrl} alt={product.Title} className="w-full h-48 object-cover" />
                    {isOutOfStock && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">OUT OF STOCK</div>
                    )}
                    <button 
                        onClick={handleToggleWishlist}
                        disabled={isWishlisting}
                        className="absolute top-2 right-2 text-white bg-black bg-opacity-25 rounded-full p-1.5 hover:bg-opacity-50 hover:text-red-500 transition-colors flex items-center justify-center min-w-[28px] min-h-[28px]"
                        aria-label="Toggle wishlist"
                    >
                        {isWishlisting ? (
                            <LoadingSpinner size="xs" color="white" />
                        ) : isInWishlist ? (
                            <FilledHeartIcon />
                        ) : (
                            <HeartIcon />
                        )}
                    </button>
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{product.Title}</h3>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-900 font-bold">Rs.{(product.Price ?? 0).toFixed(2)}</span>
                        <span className="text-teal-600 text-sm font-semibold">{product.EcoPoints ?? 0}EP~</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button 
                            onClick={handleBuyNow}
                            disabled={isOutOfStock || isBuying}
                            className="w-full bg-green-500 text-white py-2 px-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-sm font-medium transition-colors"
                        >
                            {isBuying ? (
                                <>
                                    <LoadingSpinner size="xs" color="white" />
                                    <span>...</span>
                                </>
                            ) : isOutOfStock ? (
                                'Out of Stock'
                            ) : (
                                'Buy Now'
                            )}
                        </button>
                        <button 
                            onClick={handleAddToCart} 
                            disabled={isOutOfStock || isAdding}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-2 rounded-md hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-sm font-medium transition-colors"
                        >
                            {isAdding ? (
                                <>
                                    <LoadingSpinner size="xs" color="gray" />
                                    <span>Adding...</span>
                                </>
                            ) : isOutOfStock ? (
                                'Out of Stock'
                            ) : (
                                'Add to Cart'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}