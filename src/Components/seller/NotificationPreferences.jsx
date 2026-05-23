import React from 'react';
import toast from 'react-hot-toast';
import { updateUserProfile } from '../../Service/User';

const SettingsCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">{title}</h3>
        {children}
    </div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-gray-700">{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
        </label>
    </div>
);

export default function NotificationPreferences({ profile, onUpdate }) {
    
    const proceedWithUpdate = async (name, checked) => {
        const newPreferences = {
            ...profile.notificationPreferences,
            [name]: checked,
        };

        try {
            const updatedProfile = await updateUserProfile({ notificationPreferences: newPreferences });
            onUpdate(updatedProfile); // Update parent state
            toast.success("Notification preferences updated!");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update preferences.");
        }
    };

    const promptForChange = (e) => {
        const { name, checked } = e.target;
        const action = checked ? "Enable" : "Disable";
        const settingName = name === 'newOrders' ? "new order emails" : "low stock alerts";
        
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">{`${action} ${settingName}?`}</p>
                <div className="flex gap-4">
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={() => { proceedWithUpdate(name, checked); toast.dismiss(t.id); }}>
                        Confirm
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    return (
        <SettingsCard title="Notification Preferences">
            <p className="text-gray-600 mb-4">Choose how you receive notifications.</p>
            <div className="space-y-4">
                <ToggleSwitch 
                    label="Email for new orders"
                    name="newOrders"
                    checked={profile.notificationPreferences?.newOrders ?? true}
                    onChange={promptForChange}
                />
                <ToggleSwitch
                    label="Email for low stock alerts"
                    name="lowStock"
                    checked={profile.notificationPreferences?.lowStock ?? true}
                    onChange={promptForChange}
                />
            </div>
        </SettingsCard>
    );
}