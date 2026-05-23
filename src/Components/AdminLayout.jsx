import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const SellerIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const ProductIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>;
const ReportIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;


const AdminLayout = () => {
    const navigate = useNavigate();
    const getNavLinkClass = ({ isActive }) =>
        `flex items-center space-x-3 py-2 px-4 rounded transition-colors duration-200 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`;

    const handleLogout = () => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Logout from Admin Panel?</p>
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
        <div className="flex h-screen bg-gray-50 font-sans">
            <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center space-x-2 mb-10">
                        <span className="text-2xl font-bold text-green-700">EcoAdmin</span>
                    </div>
                    <nav className="flex flex-col space-y-2">
                        <NavLink to="/admin/dashboard" className={getNavLinkClass}>
                            <DashboardIcon /> <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/manage-users" className={getNavLinkClass}>
                            <UserIcon /> <span>User Management</span>
                        </NavLink>
                        <NavLink to="/admin/manage-sellers" className={getNavLinkClass}>
                            <SellerIcon /> <span>Seller Management</span>
                        </NavLink>
                        <NavLink to="/admin/manage-products" className={getNavLinkClass}>
                            <ProductIcon /> <span>Product Management</span>
                        </NavLink>
                         <NavLink to="/admin/settings" className={getNavLinkClass}>
                            <SettingsIcon /> <span>Settings</span>
                        </NavLink>
                    </nav>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left py-2 px-4 rounded text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                >
                    <LogoutIcon /> <span>Logout</span>
                </button>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;