import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./customer/CustomerSidebar";
import "./customer/CustomerDashboard.css";

function getCartItemCount() {
    const cart = JSON.parse(localStorage.getItem("shopstack-cart") || "[]");
    return cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
}

function CustomerDashboard() {

    const username = localStorage.getItem("username");
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(getCartItemCount);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);

    useEffect(() => {
        fetch("http://localhost:8080/api/products")
            .then(response => response.ok ? response.json() : [])
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]));
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            setCartCount(getCartItemCount());
            setWishlistCount(JSON.parse(localStorage.getItem("shopstack-wishlist") || "[]").length);
            setOrderCount(JSON.parse(localStorage.getItem("shopstack-orders") || "[]").length);
        };
        updateCartCount();
        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);
        window.addEventListener("ordersUpdated", updateCartCount);
        window.addEventListener("focus", updateCartCount);
        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);
            window.removeEventListener("ordersUpdated", updateCartCount);
            window.removeEventListener("focus", updateCartCount);
        };
    }, []);

    return (

        <div className="dashboard-container">

            <CustomerSidebar />

            <div className="dashboard-main">

                {/* Header */}

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Customer Dashboard
                        </h1>

                        <p>
                            Welcome back, <strong>{username}</strong>
                        </p>

                    </div>

                </div>

                {/* Statistics */}

                <div className="cards">

                    <div className="card">

                        <h2>{orderCount}</h2>

                        <p>My Orders</p>

                    </div>

                    <div className="card">

                        <h2>{wishlistCount}</h2>

                        <p>Wishlist</p>

                    </div>

                    <div className="card">

                        <h2>{cartCount}</h2>

                        <p>Cart Items</p>

                    </div>

                    <div className="card">

                        <h2>Active</h2>

                        <p>Account Status</p>

                    </div>

                </div>

                {/* Categories */}

                <div className="section-card">

                    <h2>Trending Categories</h2>

                    <div className="category-container">

                        {[...new Map(products.map(product => [product.category, product])).values()].slice(0, 3).map(product => <div
                            className="category-card"
                            key={product.category}
                            onClick={() => navigate(`/customer/products?category=${encodeURIComponent(product.category)}&inStock=true`)}
                            role="button"
                            tabIndex={0}
                        >

                            <img src={product.imageUrl || "/images/accessories.jpg"} alt={product.category} />

                            <h3>{product.category}</h3>

                        </div>)}

                    </div>

                </div>

                {/* Recommended Products */}

                <div className="section-card">

                    <h2>Recommended Products</h2>

                    <div className="product-box">

                        {products.filter(product => Number(product.stock || 0) > 0).slice(0, 3).map(product => <div className="product-card" key={product.id}>

                            <img src={product.imageUrl || "/images/accessories.jpg"} alt={product.name} />

                            <h3>{product.name}</h3>

                            <p>{product.description}</p>

                            <button
                                className="view-btn"
                                onClick={() => navigate(`/customer/products?search=${encodeURIComponent(product.name)}&inStock=true`)}
                            >
                                View Product
                            </button>

                        </div>)}

                    </div>

                </div>

                {/* Orders */}

                <div className="section-card">

                    <h2>Recent Orders</h2>

                    <div className="empty-orders">

                        No orders placed yet.

                    </div>

                </div>

            </div>

        </div>

    );

}

export default CustomerDashboard;
