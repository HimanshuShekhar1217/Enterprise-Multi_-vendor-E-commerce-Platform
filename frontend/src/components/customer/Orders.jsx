import { useEffect, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import "./Orders.css";

const trackingSteps = [
    { key: "PROCESSING", label: "Processing", icon: "⚙" },
    { key: "SHIPPED", label: "Shipped", icon: "▣" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "▰" },
    { key: "DELIVERED", label: "Delivered", icon: "✓" }
];

function OrderTracking({ order, notifications, isOpen, onToggle }) {
    const orderNotifications = notifications.filter(notification => String(notification.orderReference) === String(order.id));
    const currentStatus = orderNotifications.reduce((status, notification) => {
        const currentIndex = trackingSteps.findIndex(step => step.key === status);
        const nextIndex = trackingSteps.findIndex(step => step.key === notification.orderStatus);
        return nextIndex > currentIndex ? notification.orderStatus : status;
    }, "PROCESSING");
    const currentIndex = trackingSteps.findIndex(step => step.key === currentStatus);
    const latestUpdate = orderNotifications.find(notification => notification.orderStatus === currentStatus);
    const expectedDate = new Date(new Date(order.placedAt).getTime() + (order.delivery === "express" ? 2 : 5) * 86400000);

    return <>
        <button className="track-order-btn" type="button" onClick={() => onToggle(order.id)}>{isOpen ? "Hide Tracking" : "Track Your Order"}<span>›</span></button>
        {isOpen && <section className="order-tracking-panel">
            <div className="tracking-heading"><div><span>ORDER TRACKING</span><h2>Order #{order.id}</h2><p>Placed on {new Date(order.placedAt).toLocaleString()}</p></div><b className={currentStatus === "DELIVERED" ? "tracking-delivered" : ""}>{currentStatus.replaceAll("_", " ")}</b></div>
            <div className="tracking-timeline">
                {trackingSteps.map((step, index) => <div className={`tracking-step ${index <= currentIndex ? "completed" : ""} ${index === currentIndex ? "current" : ""}`} key={step.key}><div className="tracking-step-icon">{step.icon}</div><strong>{step.label}</strong><span>{index <= currentIndex ? (index === currentIndex && currentStatus !== "DELIVERED" ? "In progress" : "Completed") : "Pending"}</span>{index < trackingSteps.length - 1 && <i className={index < currentIndex ? "filled" : ""}></i>}</div>)}
            </div>
            <div className="tracking-route"><div className="route-point"><span>▣</span><b>Warehouse</b></div><div className="route-line"><i></i><span>▰</span><i></i></div><div className="route-point destination"><span>⌂</span><b>Your Location</b></div></div>
            <div className="tracking-footer"><div><span>Expected Delivery</span><strong>{expectedDate.toLocaleDateString()} by 05:00 PM</strong></div><div><strong>{currentStatus === "DELIVERED" ? "Great! Your order has been delivered." : latestUpdate?.orderStatus === "OUT_FOR_DELIVERY" ? "Your order is out for delivery." : "Your order is on its way."}</strong><span>{currentStatus === "DELIVERED" ? "Thank you for shopping with us." : "We will keep you updated on the delivery."}</span></div></div>
        </section>}
    </>;
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [cancelling, setCancelling] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [trackingOrderId, setTrackingOrderId] = useState("");

    useEffect(() => {
        setOrders(JSON.parse(localStorage.getItem("shopstack-orders") || "[]"));
        const loadNotifications = () => fetch("http://localhost:8080/api/customer/order-notifications", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }).then(response => response.ok ? response.json() : []).then(setNotifications).catch(() => setNotifications([]));
        loadNotifications();
        const refreshTimer = setInterval(loadNotifications, 5000);
        return () => clearInterval(refreshTimer);
    }, []);

    async function cancelOrder(order) {
        if (!window.confirm("Cancel this order? The products will be returned to stock.")) return;
        setCancelling(order.id);
        try {
            const response = await fetch("http://localhost:8080/api/products/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order.items.map(item => ({ productId: item.id, quantity: item.quantity })))
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Unable to cancel this order");
            }
            const remaining = orders.filter(item => item.id !== order.id);
            setOrders(remaining);
            localStorage.setItem("shopstack-orders", JSON.stringify(remaining));
            window.dispatchEvent(new Event("ordersUpdated"));
            window.dispatchEvent(new Event("productsUpdated"));
        } catch (error) {
            alert(error.message);
        } finally {
            setCancelling("");
        }
    }

    function isOrderDelivered(order) {
        return notifications.some(notification =>
            notification.orderReference === order.id && notification.orderStatus === "DELIVERED"
        );
    }

    function getOrderStatus(order) {
        const orderNotifications = notifications.filter(notification => String(notification.orderReference) === String(order.id));
        if (orderNotifications.length === 0) return "Confirmed";
        if (orderNotifications.every(notification => notification.orderStatus === "DELIVERED")) return "Delivered";
        if (orderNotifications.some(notification => notification.orderStatus === "OUT_FOR_DELIVERY")) return "Out for Delivery";
        if (orderNotifications.some(notification => notification.orderStatus === "SHIPPED")) return "Shipped";
        return "Processing";
    }

    return <div className="orders-layout">
        <CustomerSidebar />
        <main className="orders-page">
            <div className="orders-heading"><p>Customer account</p><h1>My Orders</h1><span>Review your ShopStack purchases and delivery details.</span></div>
            {orders.length === 0 && notifications.length === 0 ? <div className="orders-empty"><h2>No orders yet</h2><p>Your completed purchases will appear here.</p></div> : orders.length > 0 ? <div className="orders-list">
                {orders.map(order => <article className={`order-card ${isOrderDelivered(order) ? "delivered-order" : ""}`} key={order.id}>
                    <OrderTracking order={order} notifications={notifications} isOpen={trackingOrderId === order.id} onToggle={id => setTrackingOrderId(current => current === id ? "" : id)} />
                    <div className="order-card-header"><div><span className="order-label">Order ID</span><strong>{order.id}</strong></div><span className={`order-status ${getOrderStatus(order) === "Delivered" ? "delivered-status" : ""}`}>{getOrderStatus(order)}</span></div>
                    <div className="order-meta"><span>{new Date(order.placedAt).toLocaleString()}</span><span>{order.payment === "online" ? "Razorpay" : "Cash on Delivery"}</span><span>{order.delivery === "express" ? "Express delivery" : "Standard delivery"}</span></div>
                    <div className="order-items">{order.items.map(item => <div className="order-item" key={item.id}><span>{item.name} <b>× {item.quantity}</b></span><strong>₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}</strong></div>)}</div>
                    <div className="order-footer"><div><span>Deliver to</span><p>{order.address?.fullName}, {order.address?.address}, {order.address?.city} {order.address?.postalCode}</p></div><strong>Total ₹{Number(order.total || 0).toLocaleString()}</strong><button className="cancel-order-btn" onClick={() => cancelOrder(order)} disabled={cancelling === order.id}>{cancelling === order.id ? "Cancelling..." : "Cancel Order"}</button></div>
                </article>)}
            </div> : <div className="orders-empty"><h2>Order history available</h2><p>Your order details are shown in the delivery updates below.</p></div>}
            {notifications.length > 0 && <section className="order-updates"><h2>Delivery Updates</h2>{notifications.map(notification => <div className={`order-update ${notification.orderStatus === "DELIVERED" ? "delivered-update" : ""}`} key={notification.id}><span className="update-dot"></span><div><strong>{notification.productName}</strong><p>{notification.orderStatus === "PROCESSING" ? "Your order is being processed." : notification.orderStatus === "SHIPPED" ? "Your order has been shipped." : notification.orderStatus === "OUT_FOR_DELIVERY" ? "Your order is out for delivery." : "Your order has been delivered."}</p><small>Customer: {notification.customerName}</small></div><b>{notification.orderStatus?.replaceAll("_", " ")}</b>{notification.orderStatus === "DELIVERED" && <div className="order-completed-banner">✓ ORDER COMPLETED</div>}</div>)}</section>}
        </main>
    </div>;
}

export default Orders;
