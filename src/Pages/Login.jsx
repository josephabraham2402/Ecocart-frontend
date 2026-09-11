import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Email, Password, SeePassword, NotSeePassword, GoogleIcon, FacebookIcon } from "../Components/Images.jsx";
import { LoadingSpinner } from "../Components/LoadingSpinner.jsx";
import { loginUser } from "../Service/Auth.js";
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password) {
            toast.error('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const data = await loginUser(email, password);
            toast.success('Login successful!');
            localStorage.setItem('user', JSON.stringify(data));
            if (data.role === 'buyer') {
                navigate('/home');
            } else if (data.role === 'seller') {
                navigate('/seller/dashboard'); 
            } else if (data.role === 'admin') {
                navigate('/admin/dashboard');
            }

        } catch (err) {
            toast.error(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
                <div className="relative hidden md:block">
                    <img
                        src="images/login-bg.png"
                        alt="Background"
                        className="w-[400px] h-full hidden rounded-l-2xl md:block object-cover"
                    />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-14">
                    <span className="mb-3 text-4xl font-bold">Welcome Back</span>
                    <span className="font-light text-gray-400 mb-8">
                        Please Login to your account
                    </span>
                    <form onSubmit={handleSubmit}>
                        <div className="py-4">
                            <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                                <span className="text-gray-500"><Email /></span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 placeholder-gray-400 bg-transparent outline-none"
                                    placeholder="Email Address"
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div className="py-4">
                            <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                                <span className="text-gray-500"><Password /></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 placeholder-gray-400 bg-transparent outline-none"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={togglePasswordVisibility} className="text-gray-500">
                                    {showPassword ? <SeePassword /> : <NotSeePassword />}
                                </button>
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 text-white p-3 rounded-lg mb-6 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 disabled:bg-orange-300 flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" color="white" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    

                    <div className="text-center text-gray-400 mt-4">
                        Do not have an account?
                        <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600"> Register</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}