import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { getAddresses, addAddress } from '../../Service/Buyer';
import { createOrder, makePayment, createRazorpayOrder } from '../../Service/Buyer';
import toast from 'react-hot-toast';

export default function Checkout() {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', postalCode: '', country: '' });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    
    const { cart, summary } = location.state || {};

    useEffect(() => {
        if (!cart || !summary) {
            toast.error("Your cart is empty. Please add items before checking out.");
            navigate('/cart');
            return;
        }

        const fetchAddresses = async () => {
            try {
                const userAddresses = await getAddresses();
                setAddresses(userAddresses);
                if (userAddresses.length > 0) {
                    const defaultAddress = userAddresses.find(a => a.isDefault) || userAddresses[0];
                    setSelectedAddress(defaultAddress._id);
                } else {
                    setShowNewAddressForm(true);
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [cart, summary, navigate]);

    const handleAddressFormChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewAddress = async (e) => {
        e.preventDefault();
        try {
            const addedAddress = await addAddress(newAddress);
            setAddresses([...addresses, addedAddress]);
            setSelectedAddress(addedAddress._id);
            setNewAddress({ street: '', city: '', state: '', postalCode: '', country: '' });
            setShowNewAddressForm(false);
            toast.success("Address added successfully.");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error("Please select or add a shipping address.");
            return;
        }

        const orderPayload = {
            products: cart.products.map(item => ({ product: item.product._id, quantity: item.quantity })),
            totalAmount: summary.total,
            address: selectedAddress,
        };

        if (paymentMethod === "COD") {
            try {
                const createdOrder = await createOrder(orderPayload);
                const paymentPayload = {
                    orderId: createdOrder._id,
                    amount: createdOrder.totalAmount, // This is correct for COD
                    method: "COD"
                };
                await makePayment(paymentPayload);
                toast.success("Order placed successfully! Redirecting...");
                navigate('/orders');
            } catch (error) {
                toast.error(error.message || "Failed to place COD order.");
            }
        } else if (paymentMethod === "UPI") {
            try {
                const razorpayPayload = { amount: summary.total };
                const razorpayOrder = await createRazorpayOrder(razorpayPayload);
                
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_ID_KEY,
                    amount: razorpayOrder.amount,
                    currency: "INR",
                    name: "EcoCart",
                    description: "Transaction for your EcoCart order",
                    order_id: razorpayOrder.id,
                    handler: async (response) => {
                        try {
                            // Order is created only after successful payment response
                            const createdOrder = await createOrder(orderPayload);
                            
                            // **THE ACTUAL FIX:** The `makePayment` call also needs the amount in the smallest unit.
                            const paymentPayload = {
                                orderId: createdOrder._id,
                                amount: createdOrder.totalAmount, // Keep this as the total in Rupees for your db record
                                method: "Razorpay",
                                transactionId: response.razorpay_payment_id
                            };
                            await makePayment(paymentPayload);

                            toast.success("Payment successful! Redirecting to your orders...");
                            navigate('/orders');
                        } catch (handlerError) {
                            toast.error(handlerError.message || "Payment verification failed. Please contact support.");
                        }
                    },
                    theme: {
                        color: "#14b8a6"
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (error) {
                toast.error(error.message || "Could not initiate payment.");
            }
        }
    };

    if (loading || !cart) return <div>Loading Checkout...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Details */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
                    <div className="space-y-4">
                        {addresses.map(addr => (
                            <div key={addr._id} className={`p-4 border rounded-lg cursor-pointer ${selectedAddress === addr._id ? 'border-teal-500 ring-2 ring-teal-500' : ''}`} onClick={() => setSelectedAddress(addr._id)}>
                                <p className="font-semibold">{addr.street}, {addr.city}</p>
                                <p>{addr.state}, {addr.country} - {addr.postalCode}</p>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={() => setShowNewAddressForm(!showNewAddressForm)} className="mt-4 text-teal-600 font-semibold">
                        {showNewAddressForm ? 'Cancel' : '+ Add New Address'}
                    </button>

                    {showNewAddressForm && (
                        <form onSubmit={handleAddNewAddress} className="mt-4 space-y-4 border-t pt-4">
                            <input name="street" value={newAddress.street} onChange={handleAddressFormChange} placeholder="Street" className="w-full p-2 border rounded" required />
                            <input name="city" value={newAddress.city} onChange={handleAddressFormChange} placeholder="City" className="w-full p-2 border rounded" required />
                            <input name="state" value={newAddress.state} onChange={handleAddressFormChange} placeholder="State" className="w-full p-2 border rounded" required />
                            <input name="postalCode" value={newAddress.postalCode} onChange={handleAddressFormChange} placeholder="Postal Code" className="w-full p-2 border rounded" required />
                            <input name="country" value={newAddress.country} onChange={handleAddressFormChange} placeholder="Country" className="w-full p-2 border rounded" required />
                            <button type="submit" className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700">Save Address</button>
                        </form>
                    )}
                </div>

                {/* Order Summary */}
                <aside className="w-full">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span>Price</span><span>Rs.{summary.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tax</span><span>Rs.{summary.tax.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>EP Gain</span><span>{summary.epGain}</span></div>
                        </div>
                        <hr className="my-4" />
                        
                        <h3 className="font-bold mb-2">Payment Method</h3>
                        <div className="space-y-2">
                            <div>
                                <input type="radio" id="cod" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <label htmlFor="cod" className="ml-2">Cash on Delivery</label>
                            </div>
                            <div>
                                <input type="radio" id="upi" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <label htmlFor="upi" className="ml-2">UPI</label>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rs.{summary.total.toFixed(2)}</span>
                        </div>
                        
                        {paymentMethod === 'COD' ? (
                            <button onClick={handlePlaceOrder} className="w-full mt-6 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 font-bold">
                                Place Order (COD)
                            </button>
                        ) : (
                            <button onClick={handlePlaceOrder} className="w-full mt-6 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 font-bold">
                                Pay with Razorpay
                            </button>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}