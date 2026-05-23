import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../Service/Auth';
import { Email } from '../../Components/Images';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address.');
            return;
        }
        setLoading(true);
        try {
            const message = await forgotPassword(email);
            toast.success(message);
        } catch (err) {
            toast.error(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="relative flex flex-col m-6 w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
                <span className="mb-3 text-4xl font-bold">Forgot Password</span>
                <span className="font-light text-gray-400 mb-8">
                    Enter your email to receive a reset link
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white p-3 rounded-lg my-6 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 disabled:bg-orange-300"
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="text-center text-gray-400 mt-4">
                    Remember your password?
                    <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600"> Login</Link>
                </div>
            </div>
        </div>
    );
}