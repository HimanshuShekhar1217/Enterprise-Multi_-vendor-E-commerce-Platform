import { useEffect, useState } from "react";
import { FaArrowLeft, FaHeart, FaRegHeart, FaShoppingBag, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import "./Wishlist.css";

const WISHLIST_KEY = "shopstack-wishlist";

function Wishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"));

    useEffect(() => {
        const updateWishlist = () => setWishlist(JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"));
        window.addEventListener("wishlistUpdated", updateWishlist);
        return () => window.removeEventListener("wishlistUpdated", updateWishlist);
    }, []);

    function removeFromWishlist(id) {
        const updated = wishlist.filter(product => product.id !== id);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
        setWishlist(updated);
        window.dispatchEvent(new Event("wishlistUpdated"));
    }

    return (
        <div className="customer-wishlist-layout">
            <CustomerSidebar />
            <main className="wishlist-page">
                <div className="wishlist-header">
                    <div><p>YOUR SAVED PRODUCTS</p><h1>My Wishlist</h1><span>{wishlist.length} saved {wishlist.length === 1 ? "product" : "products"}</span></div>
                    <button onClick={() => navigate("/customer/products")}><FaArrowLeft /> Browse Products</button>
                </div>
                {wishlist.length === 0 ? (
                    <div className="empty-wishlist"><FaHeart /><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here.</p><button onClick={() => navigate("/customer/products")}>Discover Products</button></div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map(product => (
                            <article className="wishlist-card" key={product.id}>
                                <div className="wishlist-image">
                                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <FaShoppingBag />}
                                    <button onClick={() => removeFromWishlist(product.id)} aria-label={`Remove ${product.name}`}><FaTrash /></button>
                                </div>
                                <div className="wishlist-card-content">
                                    <span>{product.category}</span><h2>{product.name}</h2><p>{product.description}</p>
                                    <div className="wishlist-card-footer"><strong>₹{Number(product.price).toLocaleString()}</strong><button onClick={() => navigate("/customer/products")}><FaRegHeart /> View Product</button></div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Wishlist;
