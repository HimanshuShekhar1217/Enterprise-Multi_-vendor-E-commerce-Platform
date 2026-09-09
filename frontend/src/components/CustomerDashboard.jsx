import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./customer/CustomerSidebar";
import "./customer/CustomerDashboard.css";
import { readCustomerStorage } from "../utils/customerStorage";

function getCartItemCount() {
    const cart = readCustomerStorage("shopstack-cart", []);
    return cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
}

function groupCustomerOrders(orderItems) {
    const grouped = new Map();
    orderItems.forEach((item) => {
        const reference = item.orderReference || item.id;
        const current = grouped.get(reference) || {
            id: reference,
            items: [],
            total: 0,
            placedAt: item.placedAt,
        };
        current.items.push(item);
        current.total += Number(item.customerTotalAmount || item.totalAmount || 0);
        if (!current.placedAt || new Date(item.placedAt) > new Date(current.placedAt)) current.placedAt = item.placedAt;
        grouped.set(reference, current);
    });
    return [...grouped.values()].sort((left, right) => new Date(right.placedAt) - new Date(left.placedAt));
}

function CustomerDashboard() {

    const username = sessionStorage.getItem("username") || localStorage.getItem("username") || "Customer";
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(getCartItemCount);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/products")
            .then(response => response.ok ? response.json() : [])
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]));
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            setCartCount(getCartItemCount());
            setWishlistCount(readCustomerStorage("shopstack-wishlist", []).length);
            const savedOrders = readCustomerStorage("shopstack-orders", []);
            setOrderCount(savedOrders.length);
            setRecentOrders(savedOrders.slice(0, 3));
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            if (token) {
                fetch("http://localhost:8080/api/customer/order-notifications", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((response) => response.ok ? response.json() : [])
                    .then((orderItems) => {
                        const customerOrders = groupCustomerOrders(Array.isArray(orderItems) ? orderItems : []);
                        setOrderCount(customerOrders.length);
                        setRecentOrders(customerOrders.slice(0, 3));
                    })
                    .catch(() => {});
            }
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

        <div className="dashboard-container customer-dashboard-container">

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

                        {[...new Map(products.map(product => [product.category, product])).values()].filter(product => product.category !== "Laptop").slice(0, 3).map(product => <div
                            className="category-card"
                            key={product.category}
                            onClick={() => navigate(`/customer/products?category=${encodeURIComponent(product.category)}&inStock=true`)}
                            role="button"
                            tabIndex={0}
                        >

                            <img src={product.imageUrl || "/images/accessories.jpg"} alt={product.category} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/laptop.jpg"; }} />

                            <h3>{product.category}</h3>

                        </div>)}

                    </div>

                </div>

                {/* Recommended Products */}

                <div className="section-card">

                    <h2>Recommended Products</h2>

                    <div className="product-box">

                        {products.filter(product => Number(product.stock || 0) > 0).slice(0, 6).map(product => <div className="product-card" key={product.id}>

                            <img src={product.imageUrl || "/images/accessories.jpg"} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/laptop.jpg"; }} />

                            <div className="recommended-product-content">
                            <div className="recommended-product-heading"><h3>{product.name}</h3><span>{product.category}</span></div>

                            <p>{product.description}</p>

                            <div className="recommended-product-footer"><strong>₹{Number(product.salePrice ?? (Number(product.price) * (1 - Number(product.discountPercentage || 0) / 100))).toLocaleString()}</strong><small>{product.stock} available</small></div>

                            <button
                                className="view-btn"
                                onClick={() => navigate(`/customer/products?search=${encodeURIComponent(product.name)}&inStock=true`)}
                            >
                                View Product
                            </button>
                            </div>

                        </div>)}

                    </div>

                </div>

                {/* Orders */}

                <div className="section-card">

                    <h2>Recent Orders</h2>

                    {recentOrders.length === 0 ? <div className="empty-orders">
                        No orders placed yet.
                    </div> : <div className="recent-orders-list">
                        {recentOrders.map(order => <div className="recent-order" key={order.id}>
                            <div><strong>{order.id}</strong><span>{order.items?.length || 0} product{order.items?.length === 1 ? "" : "s"}</span></div>
                            <div><b>₹{Number(order.total || 0).toLocaleString()}</b><span>{new Date(order.placedAt).toLocaleDateString()}</span></div>
                        </div>)}
                    </div>}

                </div>

            </div>

        </div>

    );

}

export default CustomerDashboard;
