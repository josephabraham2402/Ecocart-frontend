import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { getWishlist, removeFromWishlist, addToCart } from '../../Service/Buyer';
import toast from 'react-hot-toast';

// A simplified card for the wishlist page
const WishlistCard = ({ item, onRemove, onAddToCart }) => {
    const product = item.product;
    if (!product) return null; // Handle cases where product might be null

    const imageUrl = product.Images && product.Images.length > 0 ? product.Images[0].src : 'https://via.placeholder.com/300';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={imageUrl} alt={product.Title} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{product.Title}</h3>
                <p className="text-sm text-gray-500 mt-1">Date Added: {new Date(item.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-900 font-bold mt-2">Rs.{product.Price.toFixed(2)}</p>
                <div className="mt-4 flex space-x-2">
                    <button onClick={onAddToCart} className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">Add to Cart</button>
                    <button onClick={onRemove} className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600">Remove</button>
                </div>
            </div>
        </div>
    );
};

export default function Wishlist() {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const data = await getWishlist();
                setWishlist(data);
            } catch (error) {
                toast.error(error.message);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [navigate]);

    const handleRemove = async (productId) => {
        try {
            await removeFromWishlist(productId);
            setWishlist(prev => ({
                ...prev,
                products: prev.products.filter(item => item.product._id !== productId)
            }));
            toast.success("Item removed from wishlist.");
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId);
            toast.success("Item added to cart.");
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div>Loading Wishlist...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                        MY Wishlist
                        <svg className="w-8 h-8 ml-2 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    </h2>
                    {/* Add All / Remove All buttons can be implemented later by looping */}
                </div>

                {wishlist && wishlist.products.length > 0 ? (
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {wishlist.products.map(item => (
                            <WishlistCard 
                                key={item._id} 
                                item={item} 
                                onRemove={() => handleRemove(item.product._id)}
                                onAddToCart={() => handleAddToCart(item.product._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-12">Your wishlist is empty.</p>
                )}
            </main>
        </div>
    );
}