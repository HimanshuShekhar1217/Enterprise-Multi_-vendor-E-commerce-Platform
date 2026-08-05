import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {

    const navigate = useNavigate();

    const location = useLocation();

    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/");

    }

    return (

        <div className="sidebar">

            <div className="sidebar-logo">

                <h2>ShopStack</h2>

                <p>Vendor Panel</p>

            </div>

            <button
                className={location.pathname === "/vendor-dashboard" ? "active" : ""}
                onClick={() => navigate("/vendor-dashboard")}
            >
                Dashboard
            </button>

            <button
                className={location.pathname === "/vendor/products" ? "active" : ""}
                onClick={() => navigate("/vendor/products")}
            >
                Products
            </button>

            <button
                className={location.pathname === "/vendor/add-product" ? "active" : ""}
                onClick={() => navigate("/vendor/add-product")}
            >
                Add Product
            </button>

            <button>
                Orders
            </button>

            <button
                className={location.pathname === "/vendor-profile" ? "active" : ""}
                onClick={() => navigate("/vendor-profile")}
            >
                Vendor Profile
            </button>

            <button
                className="logout-btn"
                onClick={logout}
            >
                Logout
            </button>

        </div>

    );

}

export default Sidebar;