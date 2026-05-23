import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Email, Password, SeePassword, NotSeePassword, GoogleIcon, FacebookIcon, RoleIcon } from "../Components/Images.jsx";
import { registerUser } from "../Service/Auth.js";
import toast from 'react-hot-toast';

export default function Register() {
    // Removed name state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('seller'); // Keep this lowercase as your backend handles it
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Removed name from validation
        if (!email || !password || !confirmPassword || !role) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            // Pass the required data, including confirmPassword
            const data = await registerUser({ email, password, confirmPassword, role });
            console.log('Registration successful:', data);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'An error occurred during registration.');
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
                    <span className="mb-3 text-4xl font-bold">Register</span>
                    <span className="font-light text-gray-400 mb-8">
                        Create your account to get started
                    </span>
                    <form onSubmit={handleSubmit}>
                        {/* Name Input Removed */}

                        {/* Email Input */}
                        <div className="py-4">
                            <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                                <span className="text-gray-500"><Email /></span>
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 placeholder-gray-400 bg-transparent outline-none"
                                    placeholder="Email Address" autoComplete="email"
                                />
                            </div>
                        </div>
                        
                        {/* Role Dropdown */}
                        <div className="py-4">
                            <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                                <span className="text-gray-500"><RoleIcon /></span>
                                <select
                                    value={role} onChange={(e) => setRole(e.target.value)}
                                    className="w-full p-2 text-gray-500 bg-transparent outline-none appearance-none"
                                >
                                    <option value="buyer">Buyer</option>
                                    <option value="seller">Seller</option>
                                </select>
                            </div>
                        </div>

                        {/* Password Inputs (unchanged) */}
                         <div className="py-4">
                           <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                                <span className="text-gray-500"><Password /></span>
                                <input
                                    type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 placeholder-gray-400 bg-transparent outline-none"
                                    placeholder="Password" autoComplete="new-password"
                                />
                                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500">
                                    {showPassword ? <SeePassword /> : <NotSeePassword />}
                                </button>
                            </div>
                        </div>
                        <div className="py-4">
                           <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                                <span className="text-gray-500"><Password /></span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 placeholder-gray-400 bg-transparent outline-none"
                                    placeholder="Confirm Password" autoComplete="new-password"
                                />
                                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500">
                                    {showConfirmPassword ? <SeePassword /> : <NotSeePassword />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-orange-500 text-white p-3 rounded-lg my-6 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 disabled:bg-orange-300"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    
                    <div className="text-center text-gray-400 mt-4">
                        Already have an account?
                         <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600"> Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}