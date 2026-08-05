import React, { useEffect, useState } from "react";
import CustomerSidebar from "./customer/CustomerSidebar";
import "./customer/CustomerDashboard.css";

function CustomerDashboard() {

    const username = localStorage.getItem("username");
    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        fetch("http://localhost:8080/api/products")
            .then(response => response.ok ? response.json() : [])
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]));
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem("shopstack-cart") || "[]");
            setCartCount(cart.reduce((total, item) => total + Number(item.quantity || 1), 0));
            setWishlistCount(JSON.parse(localStorage.getItem("shopstack-wishlist") || "[]").length);
        };
        updateCartCount();
        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);
        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);
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

                        <h2>0</h2>

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

                        {products.slice(0, 3).map(product => <div className="category-card" key={product.id}>

                            <img src={product.imageUrl || "/images/accessories.jpg"} alt={product.category} />

                            <h3>{product.category}</h3>

                        </div>)}

                    </div>

                </div>

                {/* Recommended Products */}

                <div className="section-card">

                    <h2>Recommended Products</h2>

                    <div className="product-box">

                        {products.slice(0, 3).map(product => <div className="product-card" key={product.id}>

                            <img src={product.imageUrl || "/images/accessories.jpg"} alt={product.name} />

                            <h3>{product.name}</h3>

                            <p>{product.description}</p>

                            <button className="view-btn">
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
