import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { getOrders, cancelOrder } from '../../Service/Buyer';
import toast from 'react-hot-toast';

const OrderItem = ({ order, onCancel }) => {
    const firstProductItem = order.products[0];
    const product = firstProductItem?.product;

    if (!product) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 text-red-500">
                An item in this order could not be displayed (it may have been removed).
            </div>
        );
    }
    
    const imageUrl = product.Images && product.Images.length > 0 ? product.Images[0].src : 'https://via.placeholder.com/150';

    // Determine if the order can be cancelled.
    const isCancellable = order.products.every(p => p.status !== 'Delivered' && p.status !== 'Cancelled');
    
    // Calculate the overall status for display
    const overallStatus = order.products.every(p => p.status === 'Cancelled') 
        ? 'Cancelled' 
        : (order.products.some(p => p.status === 'Delivered') ? 'Delivered' : 'Processing');


    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <Link to={`/product/${product._id}`}>
                <img src={imageUrl} alt={product.Title || 'Product Image'} className="w-24 h-24 object-cover rounded-md" />
            </Link>
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center w-full">
                <div>
                    <h4 className="font-bold text-gray-500 text-sm">Product Detail</h4>
                    <Link to={`/product/${product._id}`} className="font-semibold hover:underline">{product.Title || 'N/A'}</Link>
                    <p>Price: Rs.{(product.Price ?? 0).toFixed(2)}</p>
                    <p>EP: {product.EcoPoints ?? 0}</p>
                    <p>CO₂e: {product.CarbonFootPrint ? `${product.CarbonFootPrint.toFixed(2)}g` : 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-500 text-sm">Order Detail</h4>
                    <p className="text-xs text-gray-600">OrderId: {order._id.slice(-10)}</p>
                    <p>Quantity: {order.products.reduce((acc, p) => acc + p.quantity, 0)}</p>
                    <p>Total: Rs.{(order.totalAmount ?? 0).toFixed(2)}</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-500 text-sm">Address</h4>
                    {order.address ? (
                        <p>{order.address.street}, {order.address.city}, {order.address.state}</p>
                    ) : (
                        <p>Not specified</p>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-gray-500 text-sm">Order Status</h4>
                    <p className={`font-semibold flex items-center ${overallStatus === 'Cancelled' ? 'text-red-500' : 'text-teal-600'}`}>
                        {overallStatus}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </p>
                </div>
                <div className="text-center">
                    <button 
                        onClick={() => onCancel(order._id)}
                        disabled={!isCancellable}
                        className="text-red-500 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                        Cancel Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                toast.error(error.message);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    const handleCancelOrder = (orderId) => {
        // Display a toast with confirmation buttons
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Are you sure you want to cancel?</p>
                <div className="flex gap-4">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {
                            proceedWithCancellation(orderId);
                            toast.dismiss(t.id);
                        }}
                    >
                        Confirm
                    </button>
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 6000, // Keep the toast open longer
        });
    };
    
    // The actual cancellation logic
    const proceedWithCancellation = async (orderId) => {
        try {
            const { message, order: updatedOrder } = await cancelOrder(orderId);
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === orderId ? updatedOrder : o)
            );
            toast.success(message);
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    if (loading) return <div>Loading Orders...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-bold">{orders.length}</span> Orders
                    </p>
                </div>
                <div>
                    {orders.length > 0 ? (
                        orders.map(order => <OrderItem key={order._id} order={order} onCancel={handleCancelOrder} />)
                    ) : (
                        <p className="text-center text-gray-500 mt-12 bg-white p-8 rounded-lg shadow-md">You have no orders yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
}