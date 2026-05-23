import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HeartIcon, FilledHeartIcon } from './Images';
import { addToWishlist, removeFromWishlist, addToCart } from '../Service/Buyer';

export default function ProductCard({ product, wishlistItems = [], refreshWishlist }) {
    const navigate = useNavigate();
    const isInWishlist = wishlistItems.some(item => item.product?._id === product._id);
    const isOutOfStock = product.Quantity <= 0;

    const handleToggleWishlist = async (e) => {
        e.stopPropagation();
        e.preventDefault();
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
        }
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isOutOfStock) return;
        try {
            await addToCart(product._id);
            toast.success(`${product.Title} added to cart!`);
        } catch (error) {
            toast.error(error.message || "Could not add to cart.");
        }
    };

    const handleBuyNow = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isOutOfStock) return;
        try {
            await addToCart(product._id);
            toast.success(`${product.Title} added to cart! Proceeding to checkout.`);
            navigate('/cart');
        } catch (error) {
            toast.error(error.message || "Could not process purchase.");
        }
    };

    const imageUrl = 
        product.Images && Array.isArray(product.Images) && product.Images.length > 0 && product.Images[0]?.src
        ? product.Images[0].src 
        : 'https://via.placeholder.com/300';

    return (
        <Link to={`/product/${product._id}`} className={`block group ${isOutOfStock ? 'opacity-60' : ''}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="relative">
                    <img src={imageUrl} alt={product.Title} className="w-full h-48 object-cover" />
                    {isOutOfStock && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">OUT OF STOCK</div>
                    )}
                    <button 
                        onClick={handleToggleWishlist}
                        className="absolute top-2 right-2 text-white bg-black bg-opacity-25 rounded-full p-1 hover:bg-opacity-50 hover:text-red-500 transition-colors"
                        aria-label="Toggle wishlist"
                    >
                        {isInWishlist ? <FilledHeartIcon /> : <HeartIcon />}
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
                            disabled={isOutOfStock}
                            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                        </button>
                        <button 
                            onClick={handleAddToCart} 
                            disabled={isOutOfStock}
                            className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed"
                        >
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}