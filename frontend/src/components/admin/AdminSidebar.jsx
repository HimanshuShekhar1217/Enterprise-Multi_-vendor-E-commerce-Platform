import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Admin.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStaff = (sessionStorage.getItem("role") || "").toUpperCase().replace(/^ROLE_/, "") === "STAFF";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <div className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>ShopStack</h2>
        <p>{isStaff ? "Warehouse Staff" : "Admin Panel"}</p>
      </div>

      {!isStaff && <button className={location.pathname === "/admin" ? "active" : ""} onClick={() => navigate("/admin")}>
        Dashboard
      </button>}

      {isStaff ? <><button className={location.pathname === "/staff/warehouse" ? "active" : ""} onClick={() => navigate("/staff/warehouse")}>Warehouse</button><button className={location.pathname === "/staff/returned-stock" ? "active" : ""} onClick={() => navigate("/staff/returned-stock")}>Returned Stock</button></> : <>
      <button className={location.pathname === "/admin/users" ? "active" : ""} onClick={() => navigate("/admin/users")}>Users</button>
      <button className={location.pathname === "/admin/vendors" ? "active" : ""} onClick={() => navigate("/admin/vendors")}>Vendors</button>
      <button className={location.pathname === "/admin/orders" ? "active" : ""} onClick={() => navigate("/admin/orders")}>Orders</button>
      <button className={location.pathname === "/admin/warehouse" ? "active" : ""} onClick={() => navigate("/admin/warehouse")}>Warehouse</button>
      <button className={location.pathname === "/admin/refunds" ? "active" : ""} onClick={() => navigate("/admin/refunds")}>Returns</button>
      <button className={location.pathname === "/admin/returned-stock" ? "active" : ""} onClick={() => navigate("/admin/returned-stock")}>Returned Stock</button>
      <button className={location.pathname === "/admin/reports" ? "active" : ""} onClick={() => navigate("/admin/reports")}>Reports</button>
      <button className={location.pathname === "/admin/coupons" ? "active" : ""} onClick={() => navigate("/admin/coupons")}>Coupons</button>
      <button className={location.pathname === "/admin/profile" ? "active" : ""} onClick={() => navigate("/admin/profile")}>Profile</button>
      </>}

      <button className={location.pathname === (isStaff ? "/staff/inventory" : "/admin/inventory") ? "active" : ""} onClick={() => navigate(isStaff ? "/staff/inventory" : "/admin/inventory")}>Inventory</button>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
