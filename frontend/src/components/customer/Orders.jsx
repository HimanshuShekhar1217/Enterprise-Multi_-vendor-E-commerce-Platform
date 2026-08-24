import { useEffect, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import "./Orders.css";
import "./OrdersCoupons.css";

const trackingSteps = [
    { key: "PROCESSING", label: "Processing", icon: "⚙" },
    { key: "SHIPPED", label: "Shipped", icon: "▣" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "▰" },
    { key: "DELIVERED", label: "Delivered", icon: "✓" }
];

function OrderTracking({ order, notifications, isOpen, onToggle }) {
    const orderNotifications = notifications.filter(notification => String(notification.orderReference).trim() === String(order.id).trim());
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

function normalizedStatus(value) {
    return String(value || "").trim().toUpperCase();
}

function orderReferenceMatches(left, right) {
    return normalizedStatus(left) === normalizedStatus(right);
}

function notificationMatchesOrder(notification, order) {
    return [order.id, order.orderReference, order.reference].filter(Boolean).some(reference => orderReferenceMatches(notification.orderReference, reference));
}

function savedOrderStatus(order) {
    const statuses = JSON.parse(localStorage.getItem("shopstack-order-statuses") || "{}");
    return normalizedStatus(statuses[order.orderReference || order.id]);
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [cancelling, setCancelling] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [trackingOrderId, setTrackingOrderId] = useState("");
    const [refundOrderId, setRefundOrderId] = useState("");
    const [refundReason, setRefundReason] = useState("");
    const [refundDetails, setRefundDetails] = useState("");
    const [refundSubmitting, setRefundSubmitting] = useState(false);

    useEffect(() => {
        // Delivery state comes from the backend; remove the old client-wide override.
        localStorage.removeItem("shopstack-all-orders-delivered");
        setOrders(JSON.parse(localStorage.getItem("shopstack-orders") || "[]"));
        const getAuthToken = () => sessionStorage.getItem("token") || localStorage.getItem("token");
        const loadNotifications = () => {
            const token = getAuthToken();
            if (!token) {
                setNotifications([]);
                return Promise.resolve([]);
            }
            return fetch("http://localhost:8080/api/customer/order-notifications", {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
                if (response.status === 401 || response.status === 403) {
                    setNotifications([]);
                    return [];
                }
                return response.ok ? response.json() : [];
            }).then(setNotifications).catch(() => setNotifications([]));
        };
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
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    orderReference: order.id,
                    items: order.items.map(item => ({ productId: item.id, quantity: item.quantity }))
                })
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Unable to cancel this order");
            }

            const updatedOrders = orders.map(item => item.id === order.id ? { ...item, cancelled: true, cancelledAt: new Date().toISOString() } : item);
            setOrders(updatedOrders);
            localStorage.setItem("shopstack-orders", JSON.stringify(updatedOrders));
            window.dispatchEvent(new Event("ordersUpdated"));
            window.dispatchEvent(new Event("productsUpdated"));
        } catch (error) {
            alert(error.message);
        } finally {
            setCancelling("");
        }
    }

    function isOrderCancelled(order) {
        return Boolean(order.cancelled);
    }

    function isOrderDelivered(order) {
        if (savedOrderStatus(order) === "DELIVERED") return true;
        return notifications.some(notification =>
            notificationMatchesOrder(notification, order) && normalizedStatus(notification.orderStatus) === "DELIVERED"
        );
    }

    function getRefundStatus(order) {
        const item = notifications.find(notification => notificationMatchesOrder(notification, order) && normalizedStatus(notification.refundStatus) !== "NONE");
        return normalizedStatus(item?.refundStatus) || "NONE";
    }

    async function requestRefund(order) {
        if (!refundReason) return;
        setRefundSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8080/api/customer/orders/${encodeURIComponent(order.id)}/refund-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ reason: refundReason, details: refundDetails })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || `Unable to submit refund request (${response.status}). Please restart the backend and try again.`);
            setRefundOrderId(""); setRefundReason(""); setRefundDetails("");
            setNotifications(items => items.map(item => String(item.orderReference) === String(order.id) ? { ...item, refundStatus: "PENDING" } : item));
        } catch (error) { window.alert(error.message || "Unable to submit refund request. Please try again."); } finally { setRefundSubmitting(false); }
    }

    function getOrderStatus(order) {
        if (isOrderCancelled(order)) return "Order cancelled";
        const savedStatus = savedOrderStatus(order);
        if (savedStatus === "REFUNDED") return "Refunded";
        if (savedStatus === "DELIVERED") return "Delivered";
        if (savedStatus === "OUT_FOR_DELIVERY") return "Out for Delivery";
        if (savedStatus === "SHIPPED") return "Shipped";
        const refundStatus = getRefundStatus(order);
        if (refundStatus === "PENDING") return "Refund Request";
        if (refundStatus === "APPROVED") return "Refunded";
        const orderNotifications = notifications.filter(notification => notificationMatchesOrder(notification, order));
        if (orderNotifications.some(notification => normalizedStatus(notification.orderStatus) === "DELIVERED")) return "Delivered";
        // Orders start in PROCESSING on the backend. A missing notification
        // means there has not been a status update yet, not that the order is
        // in a separate "Confirmed" state.
        if (orderNotifications.length === 0) return "Processing";
        if (orderNotifications.every(notification => normalizedStatus(notification.orderStatus) === "DELIVERED")) return "Delivered";
        if (orderNotifications.some(notification => normalizedStatus(notification.orderStatus) === "OUT_FOR_DELIVERY")) return "Out for Delivery";
        if (orderNotifications.some(notification => normalizedStatus(notification.orderStatus) === "SHIPPED")) return "Shipped";
        return "Processing";
    }

    function getCouponDetails(order) {
        const orderNotifications = notifications.filter(notification => notificationMatchesOrder(notification, order));
        const backendDiscount = orderNotifications.reduce((sum, item) => sum + Math.max(0, Number(item.totalAmount || 0) - Number(item.customerTotalAmount || item.totalAmount || 0)), 0);
        return { code: order.couponCode || "", discount: Number(order.discount || backendDiscount || 0) };
    }

    return <div className="orders-layout">
        <CustomerSidebar />
        <main className="orders-page">
            <div className="orders-heading"><p>Customer account</p><h1>My Orders</h1><span>Review your ShopStack purchases and delivery details.</span></div>
            {orders.length === 0 && notifications.length === 0 ? <div className="orders-empty"><h2>No orders yet</h2><p>Your completed purchases will appear here.</p></div> : orders.length > 0 ? <div className="orders-list">
                {orders.map(order => <article className={`order-card ${isOrderDelivered(order) ? "delivered-order" : ""} ${getRefundStatus(order) !== "NONE" ? "refund-order" : ""}`} key={order.id}>
                    {!isOrderCancelled(order) && <OrderTracking order={order} notifications={notifications} isOpen={trackingOrderId === order.id} onToggle={id => setTrackingOrderId(current => current === id ? "" : id)} />}
                    <div className="order-card-header"><div><span className="order-label">Order ID</span><strong>{order.id}</strong></div><span className={`order-status ${getOrderStatus(order) === "Delivered" ? "delivered-status" : ""}`}>{getOrderStatus(order)}</span></div>
                    <div className="order-meta"><span>{new Date(order.placedAt).toLocaleString()}</span><span>{order.payment === "online" ? "Razorpay" : "Cash on Delivery"}</span><span>{order.delivery === "express" ? "Express delivery" : "Standard delivery"}</span></div>
                    <div className="order-items">{order.items.map(item => <div className="order-item" key={item.id}><span>{item.name} <b>× {item.quantity}</b></span><strong>₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}</strong></div>)}</div>
                    <div className="order-footer"><div><span>Deliver to</span><p>{order.address?.fullName}, {order.address?.address}, {order.address?.city} {order.address?.postalCode}</p></div><div className="order-total-block">{getCouponDetails(order).discount > 0 && <div className="order-coupon-summary"><span>{getCouponDetails(order).code ? `Coupon ${getCouponDetails(order).code}` : "Coupon discount"}</span><strong>-₹{getCouponDetails(order).discount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></div>}<strong>Total ₹{Number(order.total || 0).toLocaleString()}</strong></div>{!isOrderCancelled(order) ? <button className="cancel-order-btn" onClick={() => cancelOrder(order)} disabled={cancelling === order.id}>{cancelling === order.id ? "Cancelling..." : "Cancel Order"}</button> : <span style={{ color: "#b91c1c", fontWeight: 700 }}>Order cancelled</span>}</div>
                    {isOrderDelivered(order) && !isOrderCancelled(order) && <div className="refund-area"><div className="refund-status-line"><span>Returns & refunds</span>{getRefundStatus(order) !== "NONE" && <b className={`refund-status refund-${getRefundStatus(order).toLowerCase()}`}>{getRefundStatus(order)}</b>}</div>{getRefundStatus(order) === "NONE" && (refundOrderId === order.id ? <div className="refund-form"><label>Why are you requesting a refund?<select value={refundReason} onChange={event => setRefundReason(event.target.value)}><option value="">Select a reason</option><option value="Defective or damaged product">Defective or damaged product</option><option value="Wrong product received">Wrong product received</option><option value="Product not as described">Product not as described</option><option value="Missing or incomplete items">Missing or incomplete items</option><option value="Changed my mind">Changed my mind</option><option value="Other">Other</option></select></label><label>Additional details (optional)<textarea value={refundDetails} onChange={event => setRefundDetails(event.target.value)} placeholder="Tell us what went wrong" rows="3" /></label><div><button type="button" onClick={() => requestRefund(order)} disabled={refundSubmitting || !refundReason}>{refundSubmitting ? "Sending..." : "Submit refund request"}</button><button type="button" className="refund-cancel" onClick={() => setRefundOrderId("")}>Cancel</button></div></div> : <button type="button" className="refund-request-btn" onClick={() => setRefundOrderId(order.id)}>Request return / refund</button>)}</div>}
                </article>)}
            </div> : <div className="orders-empty"><h2>Order history available</h2><p>Your order details are shown in the delivery updates below.</p></div>}
            {notifications.length > 0 && <section className="order-updates"><h2>Delivery Updates</h2>{notifications.map(notification => <div className={`order-update ${notification.orderStatus === "DELIVERED" ? "delivered-update" : ""}`} key={notification.id}><span className="update-dot"></span><div><strong>{notification.productName}</strong><p>{notification.orderStatus === "PROCESSING" ? "Your order is being processed." : notification.orderStatus === "SHIPPED" ? "Your order has been shipped." : notification.orderStatus === "OUT_FOR_DELIVERY" ? "Your order is out for delivery." : "Your order has been delivered."}</p><small>Customer: {notification.customerName}</small></div><b>{notification.orderStatus?.replaceAll("_", " ")}</b>{notification.orderStatus === "DELIVERED" && <div className="order-completed-banner">✓ ORDER COMPLETED</div>}</div>)}</section>}
        </main>
    </div>;
}

export default Orders;
