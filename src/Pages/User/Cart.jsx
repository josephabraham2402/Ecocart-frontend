import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { getCart, removeFromCart, updateCartQuantity } from '../../Service/Buyer';
import toast from 'react-hot-toast';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
    const product = item.product;
    if (!product || typeof product.Price !== 'number') return null;

    const isOutOfStock = product.Quantity <= 0;
    const imageUrl = product.Images && product.Images.length > 0 ? product.Images[0].src : 'https://via.placeholder.com/150';

    return (
        <div className={`flex items-center bg-white p-4 rounded-lg shadow-md mb-4 ${isOutOfStock ? 'opacity-50 bg-red-50' : ''}`}>
            <img src={imageUrl} alt={product.Title} className="w-24 h-24 object-cover rounded-md" />
            <div className="flex-grow mx-4">
                <h3 className="font-bold">{product.Title}</h3>
                <p>Price: Rs.{product.Price.toFixed(2)}</p>
                {isOutOfStock && <p className="font-bold text-red-600">This item is now out of stock.</p>}
            </div>
            <div className="flex items-center space-x-3">
                <button onClick={() => onQuantityChange(product._id, item.quantity - 1)} disabled={isOutOfStock} className="px-3 py-1 border rounded-md disabled:opacity-50">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => onQuantityChange(product._id, item.quantity + 1)} disabled={isOutOfStock} className="px-3 py-1 border rounded-md disabled:opacity-50">+</button>
            </div>
            <div className="w-24 text-center font-bold">
                Rs.{(product.Price * item.quantity).toFixed(2)}
            </div>
            <button onClick={() => onRemove(product._id)} className="ml-4 text-red-500 hover:text-red-700">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    );
};

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        try {
            const data = await getCart();
            setCart(data);
        } catch (error) {
            toast.error(error.message);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleQuantityChange = async (productId, quantity) => {
        if (quantity < 1) {
            await handleRemoveItem(productId);
            return;
        }
        try {
            await updateCartQuantity(productId, quantity);
            toast.success("Cart updated.");
            fetchCart();
        } catch (error)
 {
            toast.error(error.message);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromCart(productId);
            toast.success("Item removed from cart.");
            fetchCart();
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const { subtotal, tax, total, epGain, isCartInvalid } = useMemo(() => {
        if (!cart?.products?.length) return { subtotal: 0, tax: 0, total: 0, epGain: 0, isCartInvalid: false };
        
        const isCartInvalid = cart.products.some(item => item.product.Quantity <= 0);

        const subtotal = cart.products.reduce((acc, item) => {
            const price = item.product?.Price || 0;
            return acc + price * item.quantity;
        }, 0);
        const tax = subtotal * 0.10;
        const total = subtotal + tax;
        const epGain = cart.products.reduce((acc, item) => {
            const points = item.product?.EcoPoints || 0;
            return acc + points * item.quantity;
        }, 0);
        return { subtotal, tax, total, epGain, isCartInvalid };
    }, [cart]);

    const handleCheckout = () => {
        if (isCartInvalid) {
            toast.error("Please remove out-of-stock items before proceeding.");
            return;
        }
        if (!cart || cart.products.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }
        navigate('/checkout', { 
            state: { 
                cart: cart, 
                summary: { subtotal, tax, total, epGain } 
            } 
        });
    };

    if (loading) return <div>Loading Cart...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
                <div className="flex-grow">
                    {cart && cart.products.length > 0 ? (
                        cart.products.map(item => (
                            <CartItem 
                                key={item._id} 
                                item={item} 
                                onQuantityChange={handleQuantityChange} 
                                onRemove={() => handleRemoveItem(item.product._id)} 
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-12 bg-white p-8 rounded-lg shadow-md">Your cart is empty.</p>
                    )}
                </div>

                <aside className="w-full lg:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span>Price</span><span>Rs.{subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tax</span><span>Rs.{tax.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>EP Gain</span><span>{epGain}</span></div>
                        </div>
                        <hr className="my-4" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rs.{total.toFixed(2)}</span>
                        </div>
                        {isCartInvalid && (
                            <p className="text-red-500 text-sm mt-4 text-center">Your cart contains out-of-stock items. Please remove them to proceed.</p>
                        )}
                        <button 
                            onClick={handleCheckout} 
                            disabled={isCartInvalid}
                            className="w-full mt-6 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}