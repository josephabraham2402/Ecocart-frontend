// src/Pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import the necessary service functions
import { getAdminCounts, getAdminSalesAndRevenue, getAdminTopProducts, getAdminSalesOverTime } from '../../Service/AdminService';
import { LoadingScreen } from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';
// Import Recharts components
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

// Card component for displaying stats (Removed the 'change' prop display)
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow text-center border border-gray-100 min-h-[120px] flex flex-col justify-center">
        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        {/* Display loading indicator ('...') or the formatted value */}
        <p className={`text-3xl font-bold mt-1 text-gray-800 ${value === null ? 'animate-pulse' : ''}`}>
             {value !== null ? value : '...'}
        </p>
        {/* Percentage change display removed */}
    </div>
);

// Colors for the bar chart bars
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c'];

export default function AdminDashboard() {
    // State hooks for dashboard data, initialized to null for loading indication
    const [counts, setCounts] = useState({ users: null, sellers: null, products: null });
    const [sales, setSales] = useState({ totalSales: null, totalRevenue: null });
    const [topProducts, setTopProducts] = useState([]); // Raw data from API
    const [loadingStats, setLoadingStats] = useState(true); // Loading state for stat cards
    const [loadingCharts, setLoadingCharts] = useState(true); // Loading state for charts
    const [salesOverTimeData, setSalesOverTimeData] = useState([]); // Data for the line chart
    const [topProductsChartData, setTopProductsChartData] = useState([]); // Processed data for the bar chart
    const [selectedPeriod, setSelectedPeriod] = useState('month'); // State to manage selected time period ('day', 'week', 'month')

    // Function to fetch static stats (Users, Sellers, Products, Total Sales/Revenue)
    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            // Fetch counts and overall sales/revenue concurrently
            const [countsData, salesData] = await Promise.all([
                getAdminCounts(), // Fetches { users, sellers, products }
                getAdminSalesAndRevenue(), // Fetches { totalSales, totalRevenue }
            ]);
            // Update state, providing default 0 if data is missing
            setCounts({
                users: countsData?.users ?? 0,
                sellers: countsData?.sellers ?? 0,
                products: countsData?.products ?? 0 // Use count from getCounts
            });
            setSales({
                totalSales: salesData?.totalSales ?? 0,
                totalRevenue: salesData?.totalRevenue ?? 0
            });
            console.log("Fetched Counts:", countsData);
            console.log("Fetched Sales/Revenue:", salesData);
        } catch (error) {
            console.error("Stats Fetch Error:", error);
            toast.error(error.message || "Failed to load dashboard stats.");
            // Set defaults on error
            setCounts({ users: 0, sellers: 0, products: 0 });
            setSales({ totalSales: 0, totalRevenue: 0 });
        } finally {
            setLoadingStats(false);
        }
    }, []); // Empty dependency array means this runs once on mount

    // Function to fetch data needed for charts based on the selected period
    const fetchChartData = useCallback(async (period) => {
        setLoadingCharts(true);
        try {
            // Fetch top products and sales over time
            const [topProductsData, salesTimeData] = await Promise.all([
                getAdminTopProducts(), // Fetches top selling product list
                getAdminSalesOverTime(period), // Fetches aggregated sales for the period
            ]);

            setTopProducts(topProductsData || []); // Store raw top products data
            setSalesOverTimeData(salesTimeData || []); // Store time-series sales data

            // Process top products data for the bar chart (Top 7)
            const processedBarChartData = (topProductsData || []).slice(0, 7).map(p => ({
                name: p.productDetails?.Title?.substring(0, 15) + (p.productDetails?.Title?.length > 15 ? '...' : '') || `Product ${p._id.slice(-4)}`,
                'Units Sold': p.totalQuantity || 0,
            }));
            setTopProductsChartData(processedBarChartData);

            console.log(`Fetched Top Products:`, topProductsData);
            console.log(`Fetched Sales Over Time (${period}):`, salesTimeData);

        } catch (error) {
            console.error(`Chart Data Fetch Error (period: ${period}):`, error);
            toast.error(error.message || `Failed to load chart data for ${period}.`);
            // Reset chart data on error
            setTopProducts([]);
            setSalesOverTimeData([]);
            setTopProductsChartData([]);
        } finally {
            setLoadingCharts(false);
        }
    }, []); // useCallback wraps the function definition

    // useEffect hook to fetch initial stats on component mount
    useEffect(() => {
        fetchStats();
    }, [fetchStats]); // Run fetchStats when the component mounts

    // useEffect hook to fetch chart data whenever the selectedPeriod changes
    useEffect(() => {
        fetchChartData(selectedPeriod);
    }, [selectedPeriod, fetchChartData]); // Re-run when selectedPeriod or fetchChartData function changes

    // Estimate Carbon Saved (remains an estimate as backend doesn't provide this directly)
    const carbonSavedEst = topProducts.reduce((sum, p) => sum + (p.totalQuantity * (p.productDetails?.CarbonFootPrint || 0)), 0);

    // Render loading indicator if either stats or charts are still loading
    if (loadingStats || loadingCharts) {
        return (
            <LoadingScreen 
                message="Loading Admin Dashboard..." 
                subMessage="Aggregating platform metrics, sales, and analytics..." 
                fullScreen={false} 
                className="py-24"
            />
        );
    }

    // Main component render
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h2>

            {/* Stat Cards Section - Removed 'change' prop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={counts.users !== null ? counts.users.toLocaleString() : null} />
                <StatCard title="Total Sellers" value={counts.sellers !== null ? counts.sellers.toLocaleString() : null} />
                <StatCard title="Total Products" value={counts.products !== null ? counts.products.toLocaleString() : null} />
                <StatCard title="Carbon Footprint (Est.)" value={carbonSavedEst !== null ? `${Math.round(carbonSavedEst).toLocaleString()} kg` : null} />
            </div>

             {/* Performance Overview Section (Charts) */}
            <div className="mb-8">
                 <h3 className="text-xl font-semibold mb-4 text-gray-700">Performance Overview</h3>
                 {/* Buttons to switch time period */}
                 <div className="flex space-x-2 mb-4">
                    {['day', 'week', 'month'].map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)} // Update state on click
                            className={`px-3 py-1 text-sm rounded transition-colors duration-150 ${
                                selectedPeriod === period
                                ? 'bg-green-600 text-white font-semibold shadow-sm'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {/* Capitalize period name */}
                            {period.charAt(0).toUpperCase() + period.slice(1)}ly
                        </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Over Time Line Chart */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                         <h4 className="font-semibold mb-1 text-gray-600">Sales Over Time ({selectedPeriod}ly)</h4>
                         {/* Display total revenue safely */}
                         <p className="text-2xl font-bold text-gray-800">Rs.{sales.totalRevenue?.toLocaleString() ?? '...'}</p>
                         <p className="text-sm text-green-500 mb-4">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Revenue Trend</p>
                         <ResponsiveContainer width="100%" height={250}>
                             {salesOverTimeData.length > 0 ? (
                                 <LineChart data={salesOverTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                     {/* Use 'period' from backend for X-axis labels */}
                                     <XAxis dataKey="period" stroke="#9ca3af" fontSize={10} interval="preserveStartEnd" />
                                     <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`}/> {/* Format Y-axis ticks */}
                                     <Tooltip formatter={(value) => `Rs.${value.toLocaleString()}`} />
                                     <Legend />
                                     {/* Use 'revenue' from backend for Line data */}
                                     <Line type="monotone" dataKey="revenue" name={`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Revenue`} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                 </LineChart>
                              ) : (
                                // Message when no data for the selected period
                                <div className="flex items-center justify-center h-full text-gray-500">No sales data available for this period.</div>
                              )}
                         </ResponsiveContainer>
                     </div>

                     {/* Top Products by Units Sold Bar Chart */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                        <h4 className="font-semibold mb-1 text-gray-600">Top Products by Units Sold</h4>
                        <p className="text-sm text-gray-500 mb-4">Based on delivered orders.</p>
                        <ResponsiveContainer width="100%" height={250}>
                            {topProductsChartData.length > 0 ? (
                                <BarChart data={topProductsChartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}> {/* Adjusted bottom margin */}
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                     {/* Adjusted XAxis for better label display */}
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} interval={0} angle={-45} textAnchor="end" height={50}/>
                                    <YAxis stroke="#9ca3af" fontSize={12}/>
                                    <Tooltip formatter={(value) => `${value.toLocaleString()} Units`} />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Bar dataKey="Units Sold" fill="#82ca9d">
                                        {/* Apply different colors to bars */}
                                        {topProductsChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                // Message when no top product data
                                <div className="flex items-center justify-center h-full text-gray-500">No top product data available.</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                 </div>
             </div>
        </div>
    );
}