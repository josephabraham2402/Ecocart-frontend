import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { LoadingScreen } from '../../Components/LoadingSpinner';
import { getCart, removeFromCart, updateCartQuantity } from '../../Service/Buyer';
import toast from 'react-hot-toast';

const CartItem = ({ item, onQuantityChange, onRemove, isUpdating }) => {
    const product = item.product;
    if (!product || typeof product.Price !== 'number') return null;

    const isOutOfStock = product.Quantity <= 0;
    const imageUrl = product.Images && product.Images.length > 0 ? product.Images[0].src : 'https://via.placeholder.com/150';

    return (
        <div className={`relative flex items-center bg-white p-4 rounded-lg shadow-md mb-4 transition-all duration-200 ${isOutOfStock ? 'opacity-50 bg-red-50' : ''}`}>
            <img src={imageUrl} alt={product.Title} className="w-24 h-24 object-cover rounded-md" />
            <div className="flex-grow mx-4">
                <h3 className="font-bold">{product.Title}</h3>
                <p>Price: Rs.{product.Price.toFixed(2)}</p>
                {isOutOfStock && <p className="font-bold text-red-600">This item is now out of stock.</p>}
            </div>
            <div className="flex items-center space-x-3">
                <button 
                    onClick={() => onQuantityChange(product._id, item.quantity - 1)} 
                    disabled={isOutOfStock} 
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors font-semibold"
                >
                    -
                </button>
                <span className="font-medium min-w-[20px] text-center">{item.quantity}</span>
                <button 
                    onClick={() => onQuantityChange(product._id, item.quantity + 1)} 
                    disabled={isOutOfStock} 
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors font-semibold"
                >
                    +
                </button>
            </div>
            <div className="w-24 text-center font-bold">
                Rs.{(product.Price * item.quantity).toFixed(2)}
            </div>
            <button 
                onClick={() => onRemove(product._id)} 
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                title="Remove item"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    );
};

const mergeCart = (prevCart, serverCart) => {
    if (!serverCart || !Array.isArray(serverCart.products)) return prevCart;

    // Build map of existing populated product objects
    const productMap = new Map();
    (prevCart?.products || []).forEach(item => {
        const id = item.product?._id ? item.product._id.toString() : (typeof item.product === 'string' ? item.product : null);
        if (id && item.product && typeof item.product === 'object' && typeof item.product.Price === 'number') {
            productMap.set(id, item.product);
        }
    });

    return {
        ...serverCart,
        products: serverCart.products.map(item => {
            if (item.product && typeof item.product === 'object' && typeof item.product.Price === 'number') {
                return item;
            }
            const id = (item.product?._id || item.product)?.toString();
            const populated = id ? productMap.get(id) : null;
            return {
                ...item,
                product: populated || item.product
            };
        })
    };
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

        const previousCart = cart;
        // 1. Optimistic UI update (instant 0ms response)
        setCart(prev => {
            if (!prev || !prev.products) return prev;
            return {
                ...prev,
                products: prev.products.map(item => {
                    const id = (item.product?._id || item.product)?.toString();
                    return id === productId.toString()
                        ? { ...item, quantity }
                        : item;
                })
            };
        });

        // 2. Persist to server in background and safely merge
        try {
            const data = await updateCartQuantity(productId, quantity);
            if (data?.products) {
                setCart(prev => mergeCart(prev, data));
            }
        } catch (error) {
            setCart(previousCart);
            toast.error(error.message || "Failed to update quantity.");
        }
    };

    const handleRemoveItem = async (productId) => {
        const previousCart = cart;
        // 1. Optimistic UI update (instant 0ms response)
        setCart(prev => {
            if (!prev || !prev.products) return prev;
            return {
                ...prev,
                products: prev.products.filter(item => {
                    const id = (item.product?._id || item.product)?.toString();
                    return id !== productId.toString();
                })
            };
        });

        // 2. Persist to server in background and safely merge
        try {
            const data = await removeFromCart(productId);
            toast.success("Item removed from cart.");
            if (data?.products) {
                setCart(prev => mergeCart(prev, data));
            }
        } catch (error) {
            setCart(previousCart);
            toast.error(error.message || "Failed to remove item.");
        }
    };
    
    const { subtotal, tax, total, epGain, isCartInvalid } = useMemo(() => {
        if (!cart?.products?.length) return { subtotal: 0, tax: 0, total: 0, epGain: 0, isCartInvalid: false };
        
        const validItems = cart.products.filter(item => item.product && typeof item.product === 'object' && typeof item.product.Price === 'number');
        if (!validItems.length) return { subtotal: 0, tax: 0, total: 0, epGain: 0, isCartInvalid: false };

        const isCartInvalid = validItems.some(item => (item.product.Quantity || 0) <= 0);

        const subtotal = validItems.reduce((acc, item) => {
            const price = item.product?.Price || 0;
            return acc + price * item.quantity;
        }, 0);
        const tax = subtotal * 0.10;
        const total = subtotal + tax;
        const epGain = validItems.reduce((acc, item) => {
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

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Navbar />
                <LoadingScreen message="Loading your cart..." subMessage="Checking stock and eco savings..." fullScreen={false} className="min-h-[80vh]" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
                <div className="flex-grow">
                    {cart && cart.products.length > 0 ? (
                        cart.products.map(item => (
                            <CartItem 
                                key={item._id || (item.product?._id || item.product)} 
                                item={item} 
                                onQuantityChange={handleQuantityChange} 
                                onRemove={() => handleRemoveItem(item.product?._id || item.product)} 
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
                            className="w-full mt-6 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}