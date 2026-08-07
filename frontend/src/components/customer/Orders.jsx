import { useEffect, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import "./Orders.css";

function Orders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        setOrders(JSON.parse(localStorage.getItem("shopstack-orders") || "[]"));
    }, []);

    return <div className="orders-layout">
        <CustomerSidebar />
        <main className="orders-page">
            <div className="orders-heading"><p>Customer account</p><h1>My Orders</h1><span>Review your ShopStack purchases and delivery details.</span></div>
            {orders.length === 0 ? <div className="orders-empty"><h2>No orders yet</h2><p>Your completed purchases will appear here.</p></div> : <div className="orders-list">
                {orders.map(order => <article className="order-card" key={order.id}>
                    <div className="order-card-header"><div><span className="order-label">Order ID</span><strong>{order.id}</strong></div><span className="order-status">Confirmed</span></div>
                    <div className="order-meta"><span>{new Date(order.placedAt).toLocaleString()}</span><span>{order.payment === "online" ? "Razorpay" : "Cash on Delivery"}</span><span>{order.delivery === "express" ? "Express delivery" : "Standard delivery"}</span></div>
                    <div className="order-items">{order.items.map(item => <div className="order-item" key={item.id}><span>{item.name} <b>× {item.quantity}</b></span><strong>₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}</strong></div>)}</div>
                    <div className="order-footer"><div><span>Deliver to</span><p>{order.address?.fullName}, {order.address?.address}, {order.address?.city} {order.address?.postalCode}</p></div><strong>Total ₹{Number(order.total || 0).toLocaleString()}</strong></div>
                </article>)}
            </div>}
        </main>
    </div>;
}

export default Orders;
