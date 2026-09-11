import React, { useState, useEffect, useCallback } from 'react';
import { getAdminUsers, deleteAdminUser } from '../../Service/AdminService';
import { LoadingScreen } from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';

const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>;

const RolePill = ({ role }) => {
     const colorClasses = 'bg-teal-100 text-teal-800';
     const text = role === 'buyer' ? 'Buyer' : (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown');
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{text}</span>;
}


export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminUsers();
            setUsers(data || []);
        } catch (error) {
            toast.error(error.message || "Failed to fetch users.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDeleteUser = (userId, userEmail) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2 p-4">
                <p className="font-semibold text-center">Delete user <span className='font-normal'>{userEmail}</span>?</p>
                <p className="text-sm text-red-600 text-center">This action cannot be undone.</p>
                <div className="flex gap-4 mt-3">
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        onClick={async () => {
                            try {
                                await deleteAdminUser(userId); //
                                toast.success(`User ${userEmail} deleted.`);
                                fetchUsers(); 
                            } catch (error) {
                                toast.error(error.message || "Failed to delete user.");
                            }
                            toast.dismiss(t.id);
                        }}
                    >
                        Confirm Delete
                    </button>
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition-colors"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };


    if (loading) {
        return (
            <LoadingScreen 
                message="Loading Users..." 
                subMessage="Fetching registered user accounts and permissions..." 
                fullScreen={false} 
                className="py-24"
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
            </div>
            <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center space-x-4">
                <div className="flex-grow flex items-center border rounded px-2">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search buyers by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ml-2 p-1 border-0 focus:outline-none focus:ring-0 text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.name || 'N/A'}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4"><RolePill role={user.role}/></td>
                                
                                <td className="px-6 py-4 text-center">
                                     <button
                                        onClick={() => handleDeleteUser(user._id, user.email)}
                                        className="font-medium text-red-600 hover:text-red-800 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-6 text-gray-500">
                                    {users.length === 0 ? "No buyers found." : "No buyers match your search."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}