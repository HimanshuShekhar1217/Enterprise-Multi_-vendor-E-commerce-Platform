import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaLaptop, FaMinus, FaMobileAlt, FaPlus, FaShoppingBag, FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import "./Cart.css";

const CART_KEY = "shopstack-cart";

function getProductIcon(category) {

    const productCategory = category?.toLowerCase() || "";

    if (productCategory.includes("laptop")) return <FaLaptop />;
    if (productCategory.includes("mobile") || productCategory.includes("phone")) return <FaMobileAlt />;

    return <FaShoppingBag />;

}

function Cart() {

    const navigate = useNavigate();
    const [cart, setCart] = useState(() =>
        JSON.parse(localStorage.getItem(CART_KEY) || "[]")
    );

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
    }, [cart]);

    function updateQuantity(id, change) {
        setCart(items => items.map(item => {
            if (item.id !== id) return item;
            const maxStock = Number(item.stock || 0);
            const nextQuantity = Math.max(1, item.quantity + change);
            return { ...item, quantity: maxStock > 0 ? Math.min(maxStock, nextQuantity) : nextQuantity };
        }));
    }

    function removeItem(id) {
        setCart(items => items.filter(item => item.id !== id));
    }

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
        [cart]
    );

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="customer-cart-layout">

            <CustomerSidebar />

            <main className="cart-page">

                <div className="cart-heading">
                    <div>
                        <p className="cart-eyebrow">YOUR SHOPPING BAG</p>
                        <h1>Shopping Cart</h1>
                        <p>{itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout</p>
                    </div>

                    <button className="continue-shopping" onClick={() => navigate("/customer/products")}>
                        <FaArrowLeft /> Continue Shopping
                    </button>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <FaShoppingCart />
                        <h2>Your cart is empty</h2>
                        <p>Browse our products and add something you love.</p>
                        <button onClick={() => navigate("/customer/products")}>Browse Products</button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <section className="cart-items">
                            {cart.map(item => (
                                <article className="cart-item" key={item.id}>
                                    <div className="cart-item-image">
                                        <span className="cart-product-icon">
                                            {getProductIcon(item.category)}
                                        </span>
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="cart-item-details">
                                        <span>{item.category}</span>
                                        <h2>{item.name}</h2>
                                        <p>{item.description}</p>
                                        <strong>₹{Number(item.price).toLocaleString()}</strong>
                                        <small className={Number(item.stock || 0) > 0 ? "cart-stock-available" : "cart-stock-unavailable"}>
                                            {Number(item.stock || 0) > 0 ? `${item.stock} available` : "Unavailable"}
                                        </small>
                                    </div>

                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity"><FaMinus /></button>
                                            <b>{item.quantity}</b>
                                            <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity"><FaPlus /></button>
                                        </div>
                                        <b className="item-total">₹{(Number(item.price) * item.quantity).toLocaleString()}</b>
                                        <button className="remove-item" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><FaTrash /></button>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <aside className="cart-summary">
                            <h2>Order Summary</h2>
                            <div><span>Subtotal</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                            <div><span>Delivery</span><strong className="free-delivery">FREE</strong></div>
                            <hr />
                            <div className="summary-total"><span>Total</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                            <button
                                className="checkout-btn"
                                onClick={() => navigate("/customer/checkout")}
                            >
                                Proceed to Checkout
                            </button>
                        </aside>
                    </div>
                )}

            </main>
        </div>
    );
}

export default Cart;
