import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../Components/Navbar';
import { getUserProfile, updateUserProfile, getUserAddresses, addAddress, updateAddress, deleteAddress } from '../../Service/User';
import toast from 'react-hot-toast';

// AddressForm component remains unchanged...
const AddressForm = ({ initialData = {}, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        street: initialData.street || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || '',
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded-lg space-y-4">
            <input name="street" value={formData.street} onChange={handleChange} placeholder="Street" className="w-full p-2 border rounded" required />
            <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full p-2 border rounded" required />
            <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full p-2 border rounded" required />
            <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className="w-full p-2 border rounded" required />
            <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full p-2 border rounded" required />
            <div className="flex gap-4">
                <button type="submit" className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700">Save Address</button>
                <button type="button" onClick={onCancel} className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400">Cancel</button>
            </div>
        </form>
    );
};


export default function Profile() {
    const [profile, setProfile] = useState({ email: '', passwordLastChangedAt: null, profileLastUpdatedAt: null });
    const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
    const [addresses, setAddresses] = useState([]);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const fetchData = useCallback(async () => {
        try {
            const [profileData, addressesData] = await Promise.all([getUserProfile(), getUserAddresses()]);
            setProfile(profileData);
            setAddresses(addressesData);
        } catch (error) {
            toast.error(error.message);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const proceedWithEmailUpdate = async () => {
        try {
            const updatedProfile = await updateUserProfile({ email: profile.email });
            setProfile(updatedProfile); // Update profile state with new data from API
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const handleProfileUpdate = (e) => {
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
            setProfile(updatedProfile); // Update profile state with new data from API
            setPasswords({ password: '', confirmPassword: '' });
            toast.success("Password updated successfully!");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (passwords.password !== passwords.confirmPassword) {
            return toast.error("Passwords do not match.");
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

    const handleSaveAddress = async (addressData) => {
        try {
            if (editingAddressId) {
                await updateAddress(editingAddressId, addressData);
                toast.success("Address updated.");
            } else {
                await addAddress(addressData);
                toast.success("Address added.");
            }
            setEditingAddressId(null);
            setShowAddForm(false);
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteAddress = (id) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Delete this address?</p>
                <div className="flex gap-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" onClick={() => { proceedWithDelete(id); toast.dismiss(t.id); }}>
                        Delete
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    const proceedWithDelete = async (id) => {
        try {
            await deleteAddress(id);
            toast.success("Address deleted.");
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold mb-6">My Profile</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile & Password Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                        <form onSubmit={handleProfileUpdate}>
                            <h2 className="text-xl font-semibold mb-2">Update Email</h2>
                            <label className="block mb-2">Email Address</label>
                            <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full p-2 border rounded" />
                            <button type="submit" className="mt-4 bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700">Update Email</button>
                             {profile.profileLastUpdatedAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Last updated: {new Date(profile.profileLastUpdatedAt).toLocaleDateString()}
                                </p>
                            )}
                        </form>
                        <hr />
                        <form onSubmit={handlePasswordUpdate}>
                            <h2 className="text-xl font-semibold mb-2">Change Password</h2>
                            <input type="password" name="password" value={passwords.password} onChange={handlePasswordChange} placeholder="New Password" className="w-full p-2 border rounded mb-2" />
                            <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm New Password" className="w-full p-2 border rounded" />
                            <button type="submit" className="mt-4 bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700">Change Password</button>
                             {profile.passwordLastChangedAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Password last changed: {new Date(profile.passwordLastChangedAt).toLocaleDateString()}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Manage Addresses</h2>
                            <button onClick={() => { setShowAddForm(true); setEditingAddressId(null); }} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">+ Add New</button>
                        </div>
                        
                        {(showAddForm && !editingAddressId) && <AddressForm onSave={handleSaveAddress} onCancel={() => setShowAddForm(false)} />}
                        
                        <div className="space-y-4 mt-4">
                            {addresses.map(addr => (
                                editingAddressId === addr._id ? (
                                    <AddressForm key={addr._id} initialData={addr} onSave={handleSaveAddress} onCancel={() => setEditingAddressId(null)} />
                                ) : (
                                    <div key={addr._id} className="p-4 border rounded-lg">
                                        <p>{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                                        <div className="flex gap-4 mt-2">
                                            <button onClick={() => { setEditingAddressId(addr._id); setShowAddForm(false); }} className="text-blue-500 hover:underline">Edit</button>
                                            <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}