import {useState, useEffect, useCallback} from 'react';
import { getSellerProducts, createProduct, updateProduct, deleteProduct } from '../../Service/Seller';
import ProductFormModal from '../../Components/ProductFormModal';
import Pagination from '../../Components/Pagination';
import toast from 'react-hot-toast';

const getCarbonScore = (footprint) => {
    if (footprint < 1) return 'A+';
    if (footprint < 2) return 'A';
    if (footprint < 5) return 'B';
    if (footprint < 10) return 'C';
    return 'D';
};

export default function SellerProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSellerProducts({ page: currentPage, limit: 10 });
            setProducts(data.products || []);
            setTotalProducts(data.totalProducts || 0);
        } catch (error) {
            toast.error(error.message || "Failed to fetch products.");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const proceedWithSave = async (productData) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, productData);
                toast.success("Product updated successfully!");
            } else {
                await createProduct(productData);
                toast.success("Product added successfully!");
            }
            handleCloseModal();
            fetchProducts();
        } catch (error) {
            toast.error(error.message || "Failed to save product.");
        }
    };

    const handleSaveProduct = async (productData) => {
        if (editingProduct) {
            toast((t) => (
                <div className="flex flex-col items-center gap-2">
                    <p className="font-semibold">Save changes to this product?</p>
                    <div className="flex gap-4">
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => {
                                proceedWithSave(productData);
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
            proceedWithSave(productData);
        }
    };

    const handleDelete = (productId) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold">Delete this product?</p>
                <div className="flex gap-4">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {
                            proceedWithDelete(productId);
                            toast.dismiss(t.id);
                        }}
                    >
                        Delete
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
    };

    const proceedWithDelete = async (productId) => {
        try {
            await deleteProduct(productId);
            toast.success("Product deleted successfully.");
            fetchProducts();
        } catch (error) {
            toast.error(error.message || "Failed to delete product.");
        }
    };

    if (loading) return <div>Loading products...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Products</h2>
                <button onClick={() => handleOpenModal()} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">
                    Add Product
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Product ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Carbon Score</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 text-gray-500">#{product._id.slice(-5)}</td>
                                <td className="p-4 font-semibold">{product.Title}</td>
                                <td className="p-4">{product.Quantity}</td>
                                <td className="p-4">{getCarbonScore(product.CarbonFootPrint)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {product.Status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm font-semibold space-x-2">
                                    <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:underline">Edit</button>
                                    <span>|</span>
                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <p className="text-center p-4">You have not added any products yet.</p>}
                
                <Pagination 
                    productsPerPage={10}
                    totalProducts={totalProducts}
                    paginate={(page) => setCurrentPage(page)}
                    currentPage={currentPage}
                />
            </div>
            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                initialData={editingProduct}
            />
        </div>
    );
}