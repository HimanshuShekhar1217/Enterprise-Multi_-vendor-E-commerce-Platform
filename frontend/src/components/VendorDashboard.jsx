import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./dashboard/Sidebar";
import "./dashboard/Dashboard.css";

function VendorDashboard() {

    const username = localStorage.getItem("username");
    const navigate = useNavigate();
    const [productCount, setProductCount] = useState(0);
    const [orders, setOrders] = useState(0);
    const [revenue, setRevenue] = useState(0);

    useEffect(() => {
        async function loadProductCount() {
            try {
                const response = await fetch("http://localhost:8080/api/vendor/products", {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                if (response.ok) {
                    const products = await response.json();
                    if (Array.isArray(products)) {
                        setProductCount(products.length);
                        setOrders(products.reduce((total, product) => total + Number(product.soldQuantity || 0), 0));
                        setRevenue(products.reduce((total, product) => total + Number(product.price || 0) * Number(product.soldQuantity || 0), 0));
                    }
                }
            } catch {
                setProductCount(0);
            }
        }
        loadProductCount();
    }, []);

    return (

        <div className="dashboard-container vendor-dashboard-container">

            <Sidebar />

            <div className="dashboard-main">

                {/* Header */}

                <div className="dashboard-header">

                    <div>

                        <h1>

                            Vendor Dashboard

                        </h1>

                        <p>

                            Welcome back, <strong>{username}</strong>

                        </p>

                    </div>

                </div>

                {/* Statistics */}

                <div className="cards">

                    <div className="card">

                        <h2>

                            {productCount}

                        </h2>

                        <p>

                            Total Products

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            {orders}

                        </h2>

                        <p>

                            Items Sold

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            ₹0

                        </h2>

                        <p>

                            Revenue<br /><strong className="dashboard-revenue">₹{revenue.toLocaleString()}</strong>

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            5.0

                        </h2>

                        <p>

                            Store Rating

                        </p>

                    </div>

                </div>

                {/* Store Profile */}

                <div className="section-card">

                    <h2>

                        Store Information

                    </h2>

                    <div className="store-info">

                        <div className="store-logo">

                            🏪

                        </div>

                        <div>

                            <h3>

                                {username}

                            </h3>

                            <p>

                                Premium Vendor Account

                            </p>

                            <p>

                                Location: Kolkata

                            </p>

                        </div>

                    </div>

                </div>

                {/* Quick Actions */}

                <div className="section-card">

                    <h2>

                        Quick Actions

                    </h2>

                    <div className="action-grid">

                        <button onClick={() => navigate("/vendor/add-product")}>

                            Add Product

                        </button>

                        <button onClick={() => navigate("/vendor/products")}>

                            Manage Products

                        </button>

                        <button onClick={() => alert("Orders are coming soon.")}>

                            Orders

                        </button>

                        <button onClick={() => navigate("/vendor-profile")}>

                            Vendor Profile

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default VendorDashboard;
