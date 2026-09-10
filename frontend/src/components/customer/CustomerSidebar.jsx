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
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
            return fetch("https://shopstack-backend-gjv6.onrender.com/api/customer/order-notifications/unread-count", {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
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

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    function goTo(path) {
        setIsMobileOpen(false);
        navigate(path);
    }

    function logout() {
        setIsMobileOpen(false);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        sessionStorage.clear();
        navigate("/");
    }

    return (
        <>
            {/* Mobile Topbar with 3-dot button */}
            <div className="customer-mobile-topbar">
                <div className="customer-mobile-brand" onClick={() => goTo("/customer-dashboard")}>
                    <h2>ShopStack</h2>
                    <span>Customer</span>
                </div>
                <div className="customer-mobile-right">
                    <button
                        type="button"
                        className="customer-mobile-cart-btn"
                        onClick={() => goTo("/customer/cart")}
                        aria-label="Cart"
                    >
                        🛒 {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
                    </button>
                    <button
                        type="button"
                        className="mobile-kebab-btn"
                        onClick={() => setIsMobileOpen(prev => !prev)}
                        aria-label="Toggle Navigation Menu"
                        aria-expanded={isMobileOpen}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2.2" />
                            <circle cx="12" cy="12" r="2.2" />
                            <circle cx="12" cy="19" r="2.2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Backdrop */}
            {isMobileOpen && (
                <div
                    className="customer-sidebar-backdrop"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar / Drawer */}
            <aside className={`customer-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-content">
                        <h2>ShopStack</h2>
                        <p>Customer Panel</p>
                    </div>
                    {isMobileOpen && (
                        <button
                            type="button"
                            className="sidebar-close-btn"
                            onClick={() => setIsMobileOpen(false)}
                            aria-label="Close Menu"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <button
                    className={location.pathname === "/customer-dashboard" ? "active" : ""}
                    onClick={() => goTo("/customer-dashboard")}
                >
                    🏠 Dashboard
                </button>

                <button
                    className={location.pathname === "/customer/notifications" ? "active" : ""}
                    onClick={() => goTo("/customer/notifications")}
                >
                    {notificationCount > 0 && (
                        <span className="notification-dot" aria-label={`${notificationCount} unread notifications`}></span>
                    )}
                    🔔 Notifications
                </button>

                <button
                    className={location.pathname === "/customer/products" ? "active" : ""}
                    onClick={() => goTo("/customer/products")}
                >
                    🛍 Products
                </button>

                <button
                    className={location.pathname === "/customer/cart" ? "active" : ""}
                    onClick={() => goTo("/customer/cart")}
                >
                    <span className="cart-count-badge">{cartCount}</span>
                    🛒 Cart
                </button>

                <button
                    className={location.pathname === "/customer/orders" ? "active" : ""}
                    onClick={() => goTo("/customer/orders")}
                >
                    📦 Orders
                </button>

                <button
                    className={location.pathname === "/customer/wishlist" ? "active" : ""}
                    onClick={() => goTo("/customer/wishlist")}
                >
                    <span className="wishlist-count-badge">{wishlistCount}</span>
                    ❤️ Wishlist
                </button>

                <button
                    className={location.pathname === "/customer/returns" ? "active" : ""}
                    onClick={() => goTo("/customer/returns")}
                >
                    🔄 Returns & Refunds
                </button>

                <button
                    className={location.pathname === "/customer-profile" || location.pathname === "/customer/profile" ? "active" : ""}
                    onClick={() => goTo("/customer-profile")}
                >
                    👤 Profile
                </button>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    🚪 Logout
                </button>
            </aside>
        </>
    );
}

export default CustomerSidebar;
