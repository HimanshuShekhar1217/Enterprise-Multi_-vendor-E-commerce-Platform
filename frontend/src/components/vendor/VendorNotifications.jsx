import { useEffect, useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "./VendorNotifications.css";

function VendorNotifications() {
    const [notifications, setNotifications] = useState([]);

    async function loadNotifications() {
        const response = await fetch("http://localhost:8080/api/vendor/orders", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) setNotifications(await response.json());
    }

    useEffect(() => {
        loadNotifications();
        const timer = setInterval(loadNotifications, 5000);
        return () => clearInterval(timer);
    }, []);

    async function markRead(notification) {
        if (notification.status !== "NEW") return;
        await fetch(`http://localhost:8080/api/vendor/orders/${notification.id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setNotifications(items => items.map(item => item.id === notification.id ? { ...item, status: "READ" } : item));
    }

    return <div className="vendor-notifications-layout"><Sidebar /><main className="vendor-notifications-page"><p>ACCOUNT UPDATES</p><h1>Notifications</h1><span>New customer order alerts appear here.</span><section>{notifications.length === 0 ? <div className="vendor-notification-empty">No notifications yet.</div> : notifications.map(notification => <article className={notification.status === "NEW" ? "new-notification" : ""} key={notification.id} onClick={() => markRead(notification)}><span className="notification-icon">🔔</span><div><strong>{notification.status === "NEW" ? "New order received" : "Order notification"}</strong><p>{notification.customerName} placed an order.</p><small>{new Date(notification.placedAt).toLocaleString()}</small></div></article>)}</section></main></div>;
}

export default VendorNotifications;
