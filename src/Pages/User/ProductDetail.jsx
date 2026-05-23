import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Reviews from '../../Components/Reviews';
import { getProductById } from '../../Service/Product';
import { addToCart } from '../../Service/Buyer';
import toast from 'react-hot-toast';

export default function ProductDetail() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id: productId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(productId);
                setProduct(data);
            } catch (error) {
                toast.error(error.message || "Could not find product.");
                navigate('/shop');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, navigate]);

    const handleAddToCart = async () => {
        if (product.Quantity <= 0) return;
        try {
            await addToCart(product._id);
            toast.success(`${product.Title} added to cart!`);
        } catch (error) {
            toast.error(error.message || "Could not add to cart.");
        }
    };

    const handleBuyNow = async () => {
        if (product.Quantity <= 0) return;
        try {
            await addToCart(product._id);
            toast.success(`${product.Title} added to cart! Proceeding to checkout.`);
            navigate('/cart');
        } catch (error) {
            toast.error(error.message || "Could not process purchase.");
        }
    };

    if (loading) return <div>Loading Product...</div>;
    if (!product) return <div>Product not found.</div>;

    const imageUrl = product.Images && product.Images.length > 0 ? product.Images[0].src : 'https://via.placeholder.com/400';
    const isOutOfStock = product.Quantity <= 0;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Product Image */}
                        <div>
                            <img src={imageUrl} alt={product.Title} className="w-full h-auto object-cover rounded-lg" />
                        </div>

                        {/* Product Info */}
                        <div>
                            <div className="flex justify-between items-start">
                                <h1 className="text-3xl font-bold text-gray-800">{product.Title}</h1>
                                <span className="bg-teal-100 text-teal-800 text-lg font-semibold px-3 py-1 rounded-full">{product.EcoPoints}EP</span>
                            </div>
                            <p className="text-2xl font-semibold text-gray-700 mt-2">Rs.{(product.Price ?? 0).toFixed(2)}</p>
                            
                            {isOutOfStock && (
                                <p className="text-xl font-bold text-red-500 mt-2">OUT OF STOCK</p>
                            )}

                            <p className="text-yellow-500 mt-2">Rating: {(product.rating?.average || 0).toFixed(1)} / 5 ({product.rating?.count || 0} reviews)</p>
                            
                            <p className="text-gray-600 mt-4">{product.Description}</p>

                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-semibold text-lg mb-2">Features:</h3>
                                <p><strong>Weight:</strong> {product.Weight}KG</p>
                                <p><strong>Dimensions:</strong> {product.Height} x {product.Width} cm</p>
                                <p><strong>Material:</strong> {product.Category}</p>
                            </div>

                            <div className="mt-6 flex space-x-4">
                                <button 
                                    onClick={handleBuyNow} 
                                    disabled={isOutOfStock}
                                    className="flex-1 bg-green-500 text-white font-bold py-3 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                                </button>
                                <button 
                                    onClick={handleAddToCart} 
                                    disabled={isOutOfStock}
                                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-md hover:bg-gray-300 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed"
                                >
                                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Reviews Section */}
                    <Reviews productId={productId} />
                </div>
            </main>
        </div>
    );
}