import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../Service/User';
import toast from 'react-hot-toast';

import AccountCredentials from '../../Components/seller/AccountCredentials';
import StoreInformation from '../../Components/seller/StoreInformation';
import NotificationPreferences from '../../Components/seller/NotificationPreferences';

const SettingsCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">{title}</h3>
        {children}
    </div>
);

export default function SellerSettings() {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await getUserProfile();
                setProfile(profileData);
            } catch (error) {
                console.log(error);
                toast.error("Could not fetch profile data.");
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
    };

    const handleLogout = () => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Are you sure you want to logout?</p>
                <div className="flex gap-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" onClick={() => {
                        localStorage.removeItem('user');
                        toast.success("Logged out successfully.");
                        navigate('/login');
                        toast.dismiss(t.id);
                    }}>
                        Logout
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    if (!profile) {
        return <div>Loading settings...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <AccountCredentials profile={profile} onUpdate={handleProfileUpdate} />
                    <SettingsCard title="Account Actions">
                        <p className="text-gray-600 mb-4">Logout from your account or permanently delete it.</p>
                        <div className="flex space-x-4">
                            <button onClick={handleLogout} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600">
                                Logout
                            </button>
                            <button className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400" disabled>
                                Delete Account
                            </button>
                        </div>
                    </SettingsCard>
                </div>
                <div className="space-y-8">
                    <NotificationPreferences profile={profile} onUpdate={handleProfileUpdate} />
                    <StoreInformation profile={profile} onUpdate={handleProfileUpdate} />
                </div>
            </div>
        </div>
    );
}