import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { updateUserProfile } from '../../Service/User';

const SettingsCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">{title}</h3>
        {children}
    </div>
);

export default function AccountCredentials({ profile, onUpdate }) {
    const [email, setEmail] = useState(profile.email || '');
    const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });

    const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const proceedWithEmailUpdate = async () => {
        try {
            const updatedProfile = await updateUserProfile({ email });
            onUpdate(updatedProfile);
            toast.success("Email updated successfully!");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleEmailUpdate = (e) => {
        e.preventDefault();
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Update your email?</p>
                <div className="flex gap-4">
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={() => { proceedWithEmailUpdate(); toast.dismiss(t.id); }}>
                        Confirm
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    const proceedWithPasswordUpdate = async () => {
        try {
            const updatedProfile = await updateUserProfile({ password: passwords.password });
            onUpdate(updatedProfile);
            setPasswords({ password: '', confirmPassword: '' });
            toast.success("Password updated successfully!");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (passwords.password !== passwords.confirmPassword) {
            return toast.error("New passwords do not match.");
        }
        if (!passwords.password) {
            return toast.error("Password cannot be empty.");
        }
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Change your password?</p>
                <div className="flex gap-4">
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={() => { proceedWithPasswordUpdate(); toast.dismiss(t.id); }}>
                        Confirm
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <SettingsCard title="Account Credentials">
            <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <button type="submit" className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">
                    Update Email
                </button>
                {profile.profileLastUpdatedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(profile.profileLastUpdatedAt).toLocaleDateString()}
                    </p>
                )}
            </form>
            <hr className="my-6" />
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" name="password" value={passwords.password} onChange={handlePasswordChange} placeholder="Enter new password" className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <button type="submit" className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">
                    Change Password
                </button>
                {profile.passwordLastChangedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                        Password last changed: {new Date(profile.passwordLastChangedAt).toLocaleDateString()}
                    </p>
                )}
            </form>
        </SettingsCard>
    );
}