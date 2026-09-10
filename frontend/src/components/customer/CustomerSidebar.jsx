import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CustomerSidebar.css";
import { readCustomerStorage } from "../../utils/customerStorage";

function getCartCount() {
    const cart = readCustomerStorage("shopstack-cart", []);
    return cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
}

function getWishlistCount() {
    return readCustomerStorage("shopstack-wishlist", []).length;
}

function CustomerSidebar() {

    const navigate = useNavigate();

    const location = useLocation();
    const [cartCount, setCartCount] = useState(getCartCount);
    const [wishlistCount, setWishlistCount] = useState(getWishlistCount);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const updateCartCount = () => {
            setCartCount(getCartCount());
            setWishlistCount(getWishlistCount());
        };
        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);
        const loadNotificationCount = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setNotificationCount(0);
                return Promise.resolve({ count: 0 });
            }
            return fetch("https://shopstack-backend-gjv6.onrender.com/api/customer/order-notifications/unread-count", { headers: { Authorization: `Bearer ${token}` } }).then(response => {
                if (response.status === 401 || response.status === 403) {
                    setNotificationCount(0);
                    return { count: 0 };
                }
                return response.ok ? response.json() : { count: 0 };
            }).then(data => setNotificationCount(data.count || 0)).catch(() => setNotificationCount(0));
        };
        loadNotificationCount();
        const notificationTimer = setInterval(loadNotificationCount, 5000);
        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);
            clearInterval(notificationTimer);
        };
    }, []);

    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/");

    }

    return (

        <div className="customer-sidebar">

            <div className="sidebar-logo">

                <h2>ShopStack</h2>

                <p>Customer Panel</p>

            </div>

            <button
                className={location.pathname === "/customer-dashboard" ? "active" : ""}
                onClick={() => navigate("/customer-dashboard")}
            >
                🏠 Dashboard
            </button>

            <button className={location.pathname === "/customer/notifications" ? "active" : ""} onClick={() => navigate("/customer/notifications")}>
                {notificationCount > 0 && <span className="notification-dot" aria-label={`${notificationCount} unread notification${notificationCount === 1 ? "" : "s"}`}></span>}
                   Notifications
            </button>

            <button
                className={location.pathname === "/customer/products" ? "active" : ""}
                onClick={() => navigate("/customer/products")}
            >
                🛍 Products
            </button>

            <button
                className={location.pathname === "/customer/cart" ? "active" : ""}
                onClick={() => navigate("/customer/cart")}
            >
                <span className="cart-count-badge">{cartCount}</span>
                🛒 Cart
            </button>

            <button
                className={location.pathname === "/customer/orders" ? "active" : ""}
                onClick={() => navigate("/customer/orders")}
            >
                📦 Orders
            </button>

            <button
                className={location.pathname === "/customer/wishlist" ? "active" : ""}
                onClick={() => navigate("/customer/wishlist")}
            >
                <span className="wishlist-count-badge">{wishlistCount}</span>
                ❤️ Wishlist
            </button>

            <button className={location.pathname === "/customer/returns" ? "active" : ""} onClick={() => navigate("/customer/returns")}>Returns & Refunds</button>

            <button
                className={location.pathname === "/customer-profile" ? "active" : ""}
                onClick={() => navigate("/customer-profile")}
            >
                👤 Profile
            </button>

            <button
                className="logout-btn"
                onClick={logout}
            >
                🚪 Logout
            </button>

        </div>

    );

}

export default CustomerSidebar;
