import React, { useState, useEffect, useCallback } from 'react';
import { getWarehouses, addWarehouse, updateWarehouse, deleteWarehouse } from '../../Service/Seller';
import toast from 'react-hot-toast';
import MapPicker from '../../Components/MapPicker';

const WarehouseForm = ({ onSave, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        street: initialData.street || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || '',
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null,
    });
    
    const initialPosition = initialData.latitude && initialData.longitude
        ? { lat: initialData.latitude, lng: initialData.longitude }
        : null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLocationSelect = useCallback((address) => {
        setFormData(prev => ({
            ...prev,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            latitude: address.lat,
            longitude: address.lng,
        }));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const requiredFields = ['name', 'street', 'city', 'state', 'postalCode', 'country'];
        for (const key of requiredFields) {
            if (!formData[key]) {
                return toast.error(`${key.charAt(0).toUpperCase() + key.slice(1)} is required.`);
            }
        }
        if (!formData.latitude || !formData.longitude) {
            return toast.error("Please select a location on the map.");
        }
        onSave(formData, !!initialData._id); // Pass a flag to indicate if it's an update
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">{initialData._id ? 'Edit Warehouse' : 'Add New Warehouse'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Location on Map <span className="text-red-500">*</span></label>
                    <MapPicker onLocationSelect={handleLocationSelect} initialPosition={initialPosition} />
                </div>
                
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Warehouse Name (e.g., Main Depot)" className="w-full p-2 border rounded" />
                <input name="street" value={formData.street} onChange={handleChange} placeholder="Street Address" className="w-full p-2 border rounded" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full p-2 border rounded" />
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full p-2 border rounded" />
                    <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className="w-full p-2 border rounded" />
                </div>
                <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full p-2 border rounded" />
                
                <div className="flex gap-4">
                    <button type="submit" className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-700">Save Warehouse</button>
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchWarehouses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getWarehouses();
            setWarehouses(data);
        } catch (error) {
            toast.error(error.message || "Failed to fetch warehouses.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);
    
    const proceedWithSave = async (formData) => {
        try {
            if (editingWarehouse) {
                await updateWarehouse(editingWarehouse._id, formData);
                toast.success("Warehouse updated!");
            } else {
                await addWarehouse(formData);
                toast.success("Warehouse added!");
            }
            setShowForm(false);
            setEditingWarehouse(null);
            fetchWarehouses();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSave = (formData, isUpdate) => {
        if (isUpdate) {
            toast((t) => (
                <div className="flex flex-col items-center gap-2">
                    <p className="font-semibold">Save changes to this warehouse?</p>
                    <div className="flex gap-4">
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => {
                                proceedWithSave(formData);
                                toast.dismiss(t.id);
                            }}
                        >
                            Confirm
                        </button>
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                            onClick={() => toast.dismiss(t.id)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ));
        } else {
            proceedWithSave(formData);
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Delete this warehouse?</p>
                <div className="flex gap-4">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                        onClick={async () => {
                            try {
                                await deleteWarehouse(id);
                                toast.success("Warehouse deleted.");
                                fetchWarehouses();
                            } catch (error) {
                                toast.error(error.message);
                            }
                            toast.dismiss(t.id);
                        }}
                    >
                        Delete
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setShowForm(true);
    };
    
    const handleAddNew = () => {
        setEditingWarehouse(null);
        setShowForm(true);
    };
    
    if (loading) return <div>Loading Warehouses...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Warehouses</h2>
                {!showForm && (
                    <button onClick={handleAddNew} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">
                        + Add Warehouse
                    </button>
                )}
            </div>

            {showForm && <WarehouseForm onSave={handleSave} onCancel={() => { setShowForm(false); setEditingWarehouse(null); }} initialData={editingWarehouse || {}} />}

            <div className="space-y-4">
                {warehouses.map(w => (
                    <div key={w._id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{w.name}</p>
                            <p className="text-gray-600">{w.street}, {w.city}, {w.state} {w.postalCode}</p>
                        </div>
                        <div className="space-x-4">
                            <button onClick={() => handleEdit(w)} className="text-blue-600 hover:underline font-semibold">Edit</button>
                            <button onClick={() => handleDelete(w._id)} className="text-red-600 hover:underline font-semibold">Delete</button>
                        </div>
                    </div>
                ))}
                {warehouses.length === 0 && !showForm && (
                    <p className="text-center p-8 bg-white rounded-lg shadow-sm text-gray-500">You haven't added any warehouses yet.</p>
                )}
            </div>
        </div>
    );
}