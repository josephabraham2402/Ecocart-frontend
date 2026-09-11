import React, { useEffect, useState,useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllProducts } from '../../Service/Product.js';
import Navbar from '../../Components/Navbar.jsx';
import ProductCard from '../../Components/ProductCard.jsx';
import toast from 'react-hot-toast';
import { getWishlist } from '../../Service/Buyer.js';

import { LoadingScreen } from '../../Components/LoadingSpinner.jsx';

export default function Home() {
    const [products, setProducts] = useState([]);
     const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllData = useCallback(async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.token) {
                navigate('/login');
                return;
            }
            const [productsResult, wishlistData] = await Promise.all([
                getAllProducts({ sortBy: 'ecoPoints-desc', limit: 4 }),
                getWishlist()
            ]);
            
            const productList = Array.isArray(productsResult)
                ? productsResult
                : (productsResult?.products || []);
            setProducts(productList);
            setWishlist(wishlistData?.products || []);
        } catch (error) {
            toast.error(error.message || "Could not fetch data.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Navbar />
                <LoadingScreen 
                    message="Discovering sustainable products..." 
                    subMessage="Loading curated eco-friendly recommendations..." 
                    fullScreen={false} 
                    className="min-h-[80vh]" 
                />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="bg-white rounded-lg shadow-lg p-8 md:flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-bold text-teal-700">Shop Sustainable,</h2>
                        <h2 className="text-4xl font-bold text-teal-700">Feel Responsible</h2>
                        <p className="mt-4 text-gray-600">Discover eco-friendly products that make a positive impact on our environment.</p>
                        <Link to="/shop" className="mt-6 inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">
                            Shop Now
                        </Link>
                    </div>
                    <div className="mt-8 md:mt-0 md:ml-8">
                        <img src="images/home-bg.png" alt="Sustainable Products" className="rounded-lg shadow-md w-full max-w-sm" />
                    </div>
                </div>

                {/* Top Products Section */}
                <div className="mt-12">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-800">Top Eco-Friendly Products</h3>
                        <Link to="/shop" className="text-teal-600 hover:underline flex items-center">
                            View All
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                    </div>
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                        {products.slice(0, 4).map(product => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                wishlistItems={wishlist}
                                refreshWishlist={fetchAllData}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}