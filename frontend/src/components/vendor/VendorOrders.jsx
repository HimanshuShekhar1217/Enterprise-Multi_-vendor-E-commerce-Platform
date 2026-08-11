import { useEffect, useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "./VendorOrders.css";

function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusDraft, setStatusDraft] = useState({});

    async function loadOrders() {
        try {
            const response = await fetch("http://localhost:8080/api/vendor/orders", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.ok) setOrders(await response.json());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
        const refreshTimer = setInterval(loadOrders, 10000);
        return () => clearInterval(refreshTimer);
    }, []);

    async function markRead(order) {
        if (order.status !== "NEW") return;
        await fetch(`http://localhost:8080/api/vendor/orders/${order.id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setOrders(items => items.map(item => item.id === order.id ? { ...item, status: "READ" } : item));
    }

    async function updateStatus(order, orderStatus) {
        const response = await fetch(`http://localhost:8080/api/vendor/orders/${order.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify({ status: orderStatus })
        });
        if (response.ok) {
            setOrders(items => items.map(item => item.id === order.id ? { ...item, orderStatus } : item));
            setStatusDraft(items => ({ ...items, [order.id]: orderStatus }));
        } else {
            const error = await response.json().catch(() => ({}));
            alert(error.message || `Unable to update delivery status (${response.status})`);
        }
    }

    return <div className="vendor-orders-layout">
        <Sidebar />
        <main className="vendor-orders-page">
            <p className="vendor-orders-eyebrow">STORE ACTIVITY</p>
            <h1>Order Notifications</h1>
            <p className="vendor-orders-intro">See who placed orders for your products.</p>
            {loading ? <div className="vendor-orders-empty">Loading notifications...</div> : orders.length === 0 ? <div className="vendor-orders-empty">No customer orders yet.</div> : <div className="vendor-orders-list">
                {orders.map(order => <article className={`vendor-order-card ${order.status === "NEW" ? "unread" : ""}`} key={order.id} onClick={() => markRead(order)}>
                    <div className="vendor-order-top"><span>{order.status === "NEW" ? "New order" : "Viewed"}</span><time>{new Date(order.placedAt).toLocaleString()}</time></div>
                    <h2>{order.customerName} placed an order</h2>
                    <p>{order.customerEmail}{order.orderReference && ` · ${order.orderReference}`}</p>
                    <div className="vendor-order-details"><strong>{order.productName}</strong><span>Quantity: {order.quantity}</span><b>₹{Number(order.totalAmount).toLocaleString()}</b></div>
                    <div className="vendor-order-customer-details"><div><small>Phone</small><span>{order.customerPhone || "Not provided"}</span></div><div><small>Delivery address</small><span>{order.deliveryAddress || "Not provided"}</span></div><div><small>Payment</small><span>{order.paymentMethod || "Not provided"}</span></div><div><small>Delivery</small><span>{order.deliveryMethod || "Standard"}</span></div></div>
                    <div className="vendor-order-status-row"><span>Current status: <strong>{(order.orderStatus || "PROCESSING").replaceAll("_", " ")}</strong></span>{order.orderStatus !== "DELIVERED" && <div className="status-controls"><select value={statusDraft[order.id] || order.orderStatus || "PROCESSING"} onChange={event => { event.stopPropagation(); setStatusDraft(items => ({ ...items, [order.id]: event.target.value })); }}><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="DELIVERED">Delivered</option></select><button onClick={event => { event.stopPropagation(); updateStatus(order, statusDraft[order.id] || order.orderStatus || "PROCESSING"); }}>Update Status</button></div>}</div>
                    {order.orderStatus === "DELIVERED" && <div className="vendor-order-completed">✓ ORDER COMPLETED</div>}
                </article>)}
            </div>}
        </main>
    </div>;
}

export default VendorOrders;
