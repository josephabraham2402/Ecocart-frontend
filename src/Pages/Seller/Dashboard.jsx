import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getSellerOrders, getSellerProducts } from '../../Service/Seller';
import toast from 'react-hot-toast';
import Notifications from '../../Components/Notifications';

const MetricCard = ({ title, value, unit = '' }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-semibold">{title}</h3>
            <p className="text-3xl font-bold mt-2">{value}{unit}</p>
        </div>
    );
};

export default function SellerDashboard() {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, carbon: 0 });
    const [chartData, setChartData] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardData, ordersResponse, productsData] = await Promise.all([
                    getDashboardStats(),
                    getSellerOrders(),
                    getSellerProducts({ limit: 1000 })
                ]);
                
                const { keyMetrics } = dashboardData;
                
                setProducts(productsData.products || []);
                setOrders(ordersResponse.orders);

                setStats({
                    products: keyMetrics.totalProducts,
                    orders: keyMetrics.activeOrders,
                    revenue: keyMetrics.revenue,
                    carbon: keyMetrics.avgCarbon
                });
                
                const dataByDate = ordersResponse.orders.reduce((acc, order) => {
                    const date = new Date(order.createdAt).toLocaleDateString();
                    acc[date] = acc[date] || { date, sales: 0, carbon: 0 };
                    order.products.forEach(item => {
                        if (item.product) {
                           acc[date].sales += (item.product.Price || 0) * item.quantity;
                           acc[date].carbon += (item.product.CarbonFootPrint || 0) * item.quantity;
                        }
                    });
                    return acc;
                }, {});

                const formattedChartData = Object.values(dataByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
                setChartData(formattedChartData);

            } catch (error) {
                toast.error(error.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Dashboard...</div>;

    return (
        <div className="flex h-screen bg-gray-100">
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Total Products" value={stats.products} />
                    <MetricCard title="Active Orders" value={stats.orders} />
                    <MetricCard title="Revenue" value={`Rs.${stats.revenue.toFixed(2)}`} />
                    <MetricCard title="Average Carbon Impact" value={`${stats.carbon.toFixed(2)}`} unit="g CO2e" />
                </div>
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-4">Sales Trend (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `Rs.${value.toFixed(2)}`} />
                                <Legend />
                                <Line type="monotone" dataKey="sales" name="Sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-4">Carbon Footprint Trend (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toFixed(2)}g CO2e`} />
                                <Legend />
                                <Line type="monotone" dataKey="carbon" name="Carbon Impact" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <Notifications products={products} orders={orders} />
            </main>
        </div>
    );
}