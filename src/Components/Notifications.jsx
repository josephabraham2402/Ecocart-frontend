import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ icon, title, message, actionText, onActionClick }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
        <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-lg mr-4">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
        <button 
            onClick={onActionClick}
            className="text-sm font-semibold text-teal-600 hover:text-teal-800"
        >
            {actionText}
        </button>
    </div>
);


export default function Notifications({ products, orders }) {
    const navigate = useNavigate();
    const lowStockItems = products.filter(p => p.Quantity <= 5);
    const pendingOrders = orders.filter(o => o.products.some(p => p.status === 'Pending'));

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Notifications</h3>
            <div className="space-y-4">
                {lowStockItems.length > 0 && (
                    <NotificationItem 
                        icon={<svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>}
                        title="Low Stock Alert"
                        message={`${lowStockItems.length} items are running low in stock. Restock now to avoid delays.`}
                        actionText="View"
                        onActionClick={() => navigate('/seller/low-stock-products')}
                    />
                )}

                {pendingOrders.length > 0 && (
                    <NotificationItem 
                        icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>}
                        title="Pending Orders"
                        message={`You have ${pendingOrders.length} pending orders that need to be processed.`}
                        actionText="View"
                        onActionClick={() => navigate('/seller/orders')}
                    />
                )}

                {lowStockItems.length === 0 && pendingOrders.length === 0 && (
                    <p className="text-center text-gray-500 p-4 bg-white rounded-lg shadow-sm">No new notifications.</p>
                )}
            </div>
        </div>
    );
}