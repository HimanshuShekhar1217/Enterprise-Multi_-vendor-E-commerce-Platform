import { useEffect, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import "./CustomerNotifications.css";

function CustomerNotifications() {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const load = () => fetch("http://localhost:8080/api/customer/order-notifications", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(response => response.ok ? response.json() : []).then(setNotifications).catch(() => setNotifications([]));
        load();
        fetch("http://localhost:8080/api/customer/order-notifications/read-all", {
            method: "PATCH",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const timer = setInterval(load, 5000);
        return () => clearInterval(timer);
    }, []);
    const messages = { PROCESSING: "Your order is being processed.", SHIPPED: "Your order has been shipped.", OUT_FOR_DELIVERY: "Your order is out for delivery.", DELIVERED: "Your order has been delivered." };
    return <div className="customer-notifications-layout"><CustomerSidebar /><main className="customer-notifications-page"><p>ACCOUNT UPDATES</p><h1>Notifications</h1><span>Delivery updates from vendors appear here.</span><section>{notifications.length === 0 ? <div className="customer-notification-empty">No notifications yet.</div> : notifications.map(item => <article key={item.id}><div><strong>{item.productName}</strong><p>{messages[item.orderStatus] || "Your order status was updated."}</p><small>Order placed by {item.customerName}</small></div><b>{item.orderStatus?.replaceAll("_", " ")}</b></article>)}</section></main></div>;
}

export default CustomerNotifications;
