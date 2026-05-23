import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../../Service/Auth';
import { Password, SeePassword, NotSeePassword } from '../../Components/Images';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { token } = useParams(); // Get token from URL
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const message = await resetPassword(token, password);
            toast.success(message);
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'An error occurred or the token is invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="relative flex flex-col m-6 w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
                <span className="mb-3 text-4xl font-bold">Reset Password</span>
                <span className="font-light text-gray-400 mb-8">
                    Enter your new password below
                </span>
                <form onSubmit={handleSubmit}>
                    {/* New Password Input */}
                    <div className="py-4">
                        <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                            <span className="text-gray-500"><Password /></span>
                            <input
                                type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 placeholder-gray-400 bg-transparent outline-none"
                                placeholder="New Password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500">
                                {showPassword ? <SeePassword /> : <NotSeePassword />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password Input */}
                    <div className="py-4">
                        <div className="relative flex items-center border-b-2 border-gray-300 focus-within:border-orange-500">
                            <span className="text-gray-500"><Password /></span>
                            <input
                                type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 placeholder-gray-400 bg-transparent outline-none"
                                placeholder="Confirm New Password"
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500">
                                {showConfirmPassword ? <SeePassword /> : <NotSeePassword />}
                            </button>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white p-3 rounded-lg my-6 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 disabled:bg-orange-300"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}