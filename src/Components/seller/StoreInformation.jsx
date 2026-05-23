import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateUserProfile } from '../../Service/User';

const SettingsCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">{title}</h3>
        {children}
    </div>
);

export default function StoreInformation({ profile, onUpdate }) {
    const [storeInfo, setStoreInfo] = useState({
        storeName: '',
        storeDescription: ''
    });

    useEffect(() => {
        if (profile) {
            setStoreInfo({
                storeName: profile.storeName || '',
                storeDescription: profile.storeDescription || ''
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStoreInfo(prev => ({ ...prev, [name]: value }));
    };

    const proceedWithSave = async () => {
        try {
            const updatedProfile = await updateUserProfile(storeInfo);
            onUpdate(updatedProfile); // Update parent state
            toast.success("Store information updated!");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update store information.");
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Save store information?</p>
                <div className="flex gap-4">
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={() => { proceedWithSave(); toast.dismiss(t.id); }}>
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
        <SettingsCard title="Store Information">
            <p className="text-gray-600 mb-4">This information will be displayed to customers.</p>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Store Name</label>
                    <input 
                        type="text" 
                        name="storeName"
                        value={storeInfo.storeName}
                        onChange={handleChange}
                        placeholder="e.g., Green Earth Goods" 
                        className="mt-1 w-full p-2 border rounded-md" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Store Description</label>
                    <textarea 
                        name="storeDescription"
                        value={storeInfo.storeDescription}
                        onChange={handleChange}
                        placeholder="A short description of your store" 
                        className="mt-1 w-full p-2 border rounded-md" 
                        rows="3"
                    ></textarea>
                </div>
                <button type="submit" className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">
                    Save Store Info
                </button>
            </form>
        </SettingsCard>
    );
}