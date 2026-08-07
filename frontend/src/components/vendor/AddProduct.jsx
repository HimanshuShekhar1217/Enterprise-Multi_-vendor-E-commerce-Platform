import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "./VendorProducts.css";

const emptyProduct = { name: "", description: "", price: "", stock: "", category: "", imageUrl: "" };

function AddProduct() {
    const [product, setProduct] = useState(emptyProduct);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    function handleChange(event) {
        setProduct(current => ({ ...current, [event.target.name]: event.target.value }));
        setMessage("");
    }

    async function addProduct(event) {
        event.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            const response = await fetch("http://localhost:8080/api/vendor/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ ...product, price: Number(product.price), stock: Number(product.stock || 0) })
            });
            if (!response.ok) throw new Error("Unable to add product. Please check the details.");
            setMessage("Product added successfully.");
            setProduct(emptyProduct);
        } catch (error) {
            setMessage(error.message || "Unable to connect to the backend.");
        } finally {
            setSaving(false);
        }
    }

    return <div className="vendor-add-layout">
        <Sidebar />
        <main className="add-product-page">
            <div className="add-product-heading">
                <p className="eyebrow">Inventory management</p>
                <h1>Add New Product</h1>
                <p>Create a polished product listing for your ShopStack store.</p>
            </div>
            <div className="add-product-workspace">
                <form className="professional-product-form" onSubmit={addProduct}>
                    <div className="form-section-title"><span>01</span><div><h2>Product information</h2><p>Give customers the details they need.</p></div></div>
                    <label>Product name<input name="name" value={product.name} onChange={handleChange} required /></label>
                    <label className="wide-field">Description<textarea name="description" value={product.description} onChange={handleChange} rows="5" required /></label>
                    <div className="form-section-title section-break"><span>02</span><div><h2>Pricing and inventory</h2><p>Set the price and available quantity.</p></div></div>
                    <label>Price (₹)<input name="price" type="number" min="0" step="0.01" value={product.price} onChange={handleChange} required /></label>
                    <label>Available stock<input name="stock" type="number" min="0" value={product.stock} onChange={handleChange} required /></label>
                    <label>Category<input name="category" value={product.category} onChange={handleChange} required /></label>
                    <label>Image URL<input name="imageUrl" type="url" value={product.imageUrl} onChange={handleChange} /></label>
                    <button className="publish-product-btn" type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish product"}</button>
                    {message && <p className={`add-product-message ${message.includes("successfully") ? "success" : "failure"}`}>{message}</p>}
                </form>
                <aside className="product-preview-panel">
                    <p className="eyebrow">Live preview</p>
                    <div className="preview-image">{product.imageUrl ? <img src={product.imageUrl} alt="Product preview" onError={event => { event.currentTarget.style.display = "none"; }} /> : <span>Product image</span>}</div>
                    <span className="preview-category">{product.category || "Category"}</span>
                    <h2>{product.name || "Your product name"}</h2>
                    <p>{product.description || "Your product description will appear here."}</p>
                    <div className="preview-footer"><strong>₹{Number(product.price || 0).toLocaleString()}</strong><span>{product.stock || 0} in stock</span></div>
                </aside>
            </div>
        </main>
    </div>;
}

export default AddProduct;
