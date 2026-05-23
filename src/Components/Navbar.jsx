import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CartIcon, HeartIcon, ProfileIcon, SearchIcon } from './Images';
import toast from 'react-hot-toast';

export default function Navbar() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentSearch = searchParams.get('search') || '';
    const [searchValue, setSearchValue] = useState(currentSearch);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        setSearchValue(currentSearch);
    }, [currentSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
        } else {
            navigate('/shop');
        }
    };

    const handleLogout = () => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Are you sure you want to logout?</p>
                <div className="flex gap-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" onClick={() => {
                        localStorage.removeItem('user');
                        toast.success("Logged out successfully.");
                        navigate('/login');
                        toast.dismiss(t.id);
                    }}>
                        Logout
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <nav className="bg-teal-600 text-white shadow-md">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link to="/home" className="text-xl font-bold">EcoCart</Link>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/home" className="hover:text-teal-200">Home</Link>
                        <Link to="/shop" className="hover:text-teal-200">Shop</Link>
                        <Link to="/orders" className="hover:text-teal-200">Orders</Link>
                        <Link to="/my-reviews" className="hover:text-teal-200">My Reviews</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                        <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-teal-600 focus:outline-none cursor-pointer">
                           <SearchIcon/>
                        </button>
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring focus:ring-teal-500" 
                            placeholder="Search products..." 
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </form>

                    {user ? (
                        <>
                            <Link to="/wishlist" className="hover:text-teal-200" aria-label="Wishlist">
                                <HeartIcon />
                            </Link>
                            <Link to="/cart" className="hover:text-teal-200" aria-label="Cart">
                                <CartIcon />
                            </Link>
                            <Link to="/profile" className="hover:text-teal-200" aria-label="Profile">
                                <ProfileIcon />
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="font-semibold hover:text-teal-200">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}