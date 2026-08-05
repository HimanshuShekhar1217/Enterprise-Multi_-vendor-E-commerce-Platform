import { useMemo, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaLock, FaMapMarkerAlt, FaMoneyBillWave, FaMobileAlt, FaShieldAlt, FaShoppingCart, FaTruck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import "./Checkout.css";

const CART_KEY = "shopstack-cart";

function Checkout() {

    const navigate = useNavigate();
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [form, setForm] = useState({
        fullName: localStorage.getItem("username") || "",
        phone: "",
        email: localStorage.getItem("email") || "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        delivery: "standard",
        payment: "online",
        onlineMethod: "upi"
    });

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
        [cart]
    );

    const deliveryFee = form.delivery === "express" ? 99 : 0;
    const total = subtotal + deliveryFee;

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function completeOrder(paymentDetails = {}) {
        const stockResponse = await fetch("http://localhost:8080/api/products/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cart.map(item => ({ productId: item.id, quantity: item.quantity })))
        });

        if (!stockResponse.ok) {
            const stockError = await stockResponse.json().catch(() => ({}));
            setPaymentError(stockError.message || "Some products are no longer available in that quantity.");
            return;
        }

        const order = {
            id: `SS-${Date.now()}`,
            items: cart,
            total,
            delivery: form.delivery,
            payment: form.payment,
            onlineMethod: form.onlineMethod,
            paymentDetails,
            address: form,
            placedAt: new Date().toISOString()
        };

        const previousOrders = JSON.parse(localStorage.getItem("shopstack-orders") || "[]");
        localStorage.setItem("shopstack-orders", JSON.stringify([order, ...previousOrders]));
        localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new Event("productsUpdated"));
        setOrderPlaced(true);
    }

    function loadRazorpayScript() {
        return new Promise(resolve => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    async function startRazorpayPayment() {
        setPaymentError("");
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            setPaymentError("Unable to load Razorpay. Check your internet connection and try again.");
            return;
        }

        const response = await fetch("http://localhost:8080/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountInPaise: Math.round(total * 100), receipt: `shopstack_${Date.now()}` })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            setPaymentError(error.message || "Could not start the Razorpay payment.");
            return;
        }

        const razorpayOrder = await response.json();
        const razorpay = new window.Razorpay({
            key: razorpayOrder.keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "ShopStack",
            description: "ShopStack product order",
            order_id: razorpayOrder.orderId,
            prefill: { name: form.fullName, email: form.email, contact: form.phone },
            theme: { color: "#2563eb" },
            handler: async payment => {
                const verification = await fetch("http://localhost:8080/api/payments/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpayOrderId: payment.razorpay_order_id,
                        razorpayPaymentId: payment.razorpay_payment_id,
                        razorpaySignature: payment.razorpay_signature
                    })
                });
                const result = await verification.json();
                if (result.verified) await completeOrder(payment);
                else setPaymentError("Payment verification failed. Your order was not placed.");
            },
            modal: { ondismiss: () => setPaymentError("Payment was cancelled. You can try again.") }
        });
        razorpay.open();
    }

    async function placeOrder(event) {
        event.preventDefault();
        if (form.payment === "online") await startRazorpayPayment();
        else await completeOrder({ method: "cash_on_delivery" });
    }

    if (orderPlaced) {
        return (
            <div className="customer-checkout-layout">
                <CustomerSidebar />
                <main className="checkout-page checkout-success">
                    <FaCheckCircle />
                    <h1>Order Placed Successfully</h1>
                    <p>Your order has been confirmed. We’ll deliver it to the address you provided.</p>
                    <button onClick={() => navigate("/customer/products")}>Continue Shopping</button>
                </main>
            </div>
        );
    }

    return (
        <div className="customer-checkout-layout">
            <CustomerSidebar />

            <main className="checkout-page">
                <div className="checkout-heading">
                    <div>
                        <button className="back-to-cart" onClick={() => navigate("/customer/cart")}>
                            <FaArrowLeft /> Back to Cart
                        </button>
                        <h1>Checkout</h1>
                        <p>Enter your delivery and payment details to complete your order.</p>
                    </div>
                    <div className="secure-checkout"><FaLock /> Secure Checkout</div>
                </div>

                {cart.length === 0 ? (
                    <div className="checkout-empty">
                        <h2>Your cart is empty</h2>
                        <p>Add a product before going to checkout.</p>
                        <button onClick={() => navigate("/customer/products")}>Browse Products</button>
                    </div>
                ) : (
                    <form className="checkout-layout" onSubmit={placeOrder}>
                        <div className="checkout-form-column">
                            <section className="checkout-card">
                                <div className="section-title"><FaMapMarkerAlt /><div><h2>Delivery Address</h2><p>Where should we deliver your order?</p></div></div>

                                <div className="form-grid">
                                    <label>Full Name<input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Enter your full name" /></label>
                                    <label>Phone Number<input name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" placeholder="10-digit mobile number" /></label>
                                    <label className="full-field">Email Address<input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" /></label>
                                    <label className="full-field">Address<input name="address" value={form.address} onChange={handleChange} required placeholder="House number, street and landmark" /></label>
                                    <label>City<input name="city" value={form.city} onChange={handleChange} required placeholder="City" /></label>
                                    <label>State<input name="state" value={form.state} onChange={handleChange} required placeholder="State" /></label>
                                    <label>Postal Code<input name="postalCode" value={form.postalCode} onChange={handleChange} required pattern="[0-9]{6}" placeholder="6-digit PIN code" /></label>
                                </div>
                            </section>

                            <section className="checkout-card">
                                <div className="section-title"><FaTruck /><div><h2>Delivery Details</h2><p>Choose how quickly you want your order.</p></div></div>
                                <div className="choice-list">
                                    <label className={`choice-card ${form.delivery === "standard" ? "selected" : ""}`}><input type="radio" name="delivery" value="standard" checked={form.delivery === "standard"} onChange={handleChange} /><span><b>Standard Delivery</b><small>Arrives in 3–5 business days</small></span><strong>FREE</strong></label>
                                    <label className={`choice-card ${form.delivery === "express" ? "selected" : ""}`}><input type="radio" name="delivery" value="express" checked={form.delivery === "express"} onChange={handleChange} /><span><b>Express Delivery</b><small>Arrives in 1–2 business days</small></span><strong>₹99</strong></label>
                                </div>
                            </section>

                            <section className="checkout-card">
                                <div className="section-title"><FaMoneyBillWave /><div><h2>Payment Method</h2><p>Select how you would like to pay.</p></div></div>
                                <div className="choice-list">
                                    <label className={`choice-card ${form.payment === "online" ? "selected" : ""}`}><input type="radio" name="payment" value="online" checked={form.payment === "online"} onChange={handleChange} /><span><b>Online Payment</b><small>Choose UPI, Razorpay, credit card or debit card</small></span></label>

                                    {form.payment === "online" && (
                                        <div className="online-payment-options">
                                            <p>Choose an online payment mode</p>
                                            <label className={`payment-mode ${form.onlineMethod === "upi" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="upi" checked={form.onlineMethod === "upi"} onChange={handleChange} /><FaMobileAlt className="payment-mode-icon" /><span><b>UPI</b><small>Google Pay, PhonePe or Paytm</small></span></label>
                                            <label className={`payment-mode ${form.onlineMethod === "razorpay" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="razorpay" checked={form.onlineMethod === "razorpay"} onChange={handleChange} /><FaShieldAlt className="payment-mode-icon" /><span><b>Razorpay</b><small>Secure payment gateway</small></span></label>
                                            <label className={`payment-mode ${form.onlineMethod === "credit" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="credit" checked={form.onlineMethod === "credit"} onChange={handleChange} /><FaCreditCard className="payment-mode-icon" /><span><b>Credit Card</b><small>Visa, Mastercard and more</small></span></label>
                                            <label className={`payment-mode ${form.onlineMethod === "debit" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="debit" checked={form.onlineMethod === "debit"} onChange={handleChange} /><FaCreditCard className="payment-mode-icon" /><span><b>Debit Card</b><small>Visa, Mastercard and more</small></span></label>
                                        </div>
                                    )}

                                    <label className={`choice-card cod-card ${form.payment === "cod" ? "selected" : ""}`}><input type="radio" name="payment" value="cod" checked={form.payment === "cod"} onChange={handleChange} /><FaMoneyBillWave className="payment-mode-icon" /><span><b>Cash on Delivery</b><small>Pay when your order arrives</small></span><strong>COD</strong></label>
                                </div>
                            </section>

                            <div className="checkout-note"><FaLock /><span><b>Your information is safe</b><br />We use your details only to process and deliver your order.</span></div>
                        </div>

                        <aside className="checkout-summary">
                            <div className="summary-heading"><FaShoppingCart /><div><h2>Order Summary</h2><p>{cart.length} product{cart.length === 1 ? "" : "s"} in your order</p></div></div>
                            <div className="summary-products">
                                {cart.map(item => <div key={item.id}><span>{item.name} <b>× {item.quantity}</b></span><strong>₹{(Number(item.price) * item.quantity).toLocaleString()}</strong></div>)}
                            </div>
                            <hr />
                            <div><span>Subtotal</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                            <div><span>Delivery</span><strong>{deliveryFee ? `₹${deliveryFee}` : "FREE"}</strong></div>
                            <hr />
                            <div className="checkout-total"><span>Total</span><strong>₹{total.toLocaleString()}</strong></div>
                            <button className="place-order-btn" type="submit">Place Order</button>
                            {paymentError && <p className="payment-error">{paymentError}</p>}
                            <div className="important-details"><b>Important Details</b><br />Please check your address and phone number carefully. Orders cannot be edited after confirmation.</div>
                        </aside>
                    </form>
                )}
            </main>
        </div>
    );
}

export default Checkout;
