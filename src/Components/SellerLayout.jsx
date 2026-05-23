import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const SellerLayout = () => {
    const getNavLinkClass = ({ isActive }) => 
        `block py-2 px-4 rounded font-semibold ${isActive ? 'bg-teal-500 text-white' : 'hover:bg-gray-100'}`;

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">EcoCart Seller</h1>
                <nav className="flex flex-col space-y-2">
                    <NavLink to="/seller/dashboard" className={getNavLinkClass}>Dashboard</NavLink>
                    <NavLink to="/seller/products" className={getNavLinkClass}>Products</NavLink>
                    <NavLink to="/seller/orders" className={getNavLinkClass}>Orders</NavLink>
                    <NavLink to="/seller/analytics" className={getNavLinkClass}>Analytics</NavLink>
                    <NavLink to="/seller/reviews" className={getNavLinkClass}>Reviews</NavLink>
                    <NavLink to="/seller/warehouses" className={getNavLinkClass}>Warehouses</NavLink> {/* ADDED LINK */}
                    <NavLink to="/seller/settings" className={getNavLinkClass}>Settings</NavLink>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default SellerLayout;