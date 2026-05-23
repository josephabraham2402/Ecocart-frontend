import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from './Pages/User/ForgotPassword';
import ResetPassword from './Pages/User/ResetPassword';
import Home from './Pages/User/Home';
import Wishlist from './Pages/User/Wishlist';
import Cart from './Pages/User/Cart';
import Shop from './Pages/User/Shop';
import Checkout from './Pages/User/Checkout';
import Orders from './Pages/User/Orders';
import ProductDetail from './Pages/User/ProductDetail';
import Profile from './Pages/User/Profile';
import { Toaster } from 'react-hot-toast';
import SellerLayout from './Components/SellerLayout';
import SellerDashboard from './Pages/Seller/Dashboard';
import SellerProducts from './Pages/Seller/Products';
import SellerOrders from './Pages/Seller/Orders';
import MyReviews from './Pages/User/MyReviews';
import SellerAnalytics from './Pages/Seller/Analytics';
import SellerReviews from './Pages/Seller/Reviews';
import SellerSettings from './Pages/Seller/Settings';
import Warehouses from './Pages/Seller/Warehouses';
import LowStockProducts from './Pages/Seller/LowStockProducts';

import AdminLayout from './Components/AdminLayout';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ManageSellers from './Pages/Admin/ManageSellers';
import ManageUsers from './Pages/Admin/ManageUsers';
import ManageProducts from './Pages/Admin/ManageProducts';
import AdminSettings from './Pages/Admin/AdminSettings';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} /> 
        <Route path="/orders" element={<Orders />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-reviews" element={<MyReviews />} />

        <Route path="/seller" element={<SellerLayout />}>
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="reviews" element={<SellerReviews />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="settings" element={<SellerSettings />} />
          <Route path="low-stock-products" element={<LowStockProducts />} />
        </Route>



        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="manage-sellers" element={<ManageSellers />} />
           <Route path="manage-users" element={<ManageUsers />} />
           <Route path="manage-products" element={<ManageProducts />} />
           <Route path="settings" element={<AdminSettings />} />
           <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;