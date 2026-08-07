import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CustomerSidebar.css";

function getCartCount() {
    const cart = JSON.parse(localStorage.getItem("shopstack-cart") || "[]");
    return cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
}

function getWishlistCount() {
    return JSON.parse(localStorage.getItem("shopstack-wishlist") || "[]").length;
}

function CustomerSidebar() {

    const navigate = useNavigate();

    const location = useLocation();
    const [cartCount, setCartCount] = useState(getCartCount);
    const [wishlistCount, setWishlistCount] = useState(getWishlistCount);

    useEffect(() => {
        const updateCartCount = () => {
            setCartCount(getCartCount());
            setWishlistCount(getWishlistCount());
        };
        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);
        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);
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
