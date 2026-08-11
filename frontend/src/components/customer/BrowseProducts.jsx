import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    FaShoppingBag,
    FaHeart,
    FaRegHeart,
    FaSearch,
    FaBolt,
    FaShoppingCart,
    FaStore
} from "react-icons/fa";

import "./BrowseProducts.css";

function salePrice(product) {
    return Number(product.salePrice ?? (Number(product.price) * (1 - Number(product.discountPercentage || 0) / 100)));
}

function discountPercent(product) {
    const original = Number(product.price || 0);
    const discounted = salePrice(product);
    return original > discounted ? Math.round((1 - discounted / original) * 100) : 0;
}

function BrowseProducts() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState(() =>
        JSON.parse(localStorage.getItem("shopstack-wishlist") || "[]").map(item => item.id)
    );
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const inStockOnly = searchParams.get("inStock") === "true";

    useEffect(() => {
        fetchProducts();
        window.addEventListener("productsUpdated", fetchProducts);
        return () => window.removeEventListener("productsUpdated", fetchProducts);
    }, []);

    async function fetchProducts() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/products"
            );

            if (response.ok) {

                const data = await response.json();

                setProducts(data);

            }

        } catch (err) {

            console.log(err);

        }

    }

    function toggleWishlist(id) {

        const savedWishlist = JSON.parse(localStorage.getItem("shopstack-wishlist") || "[]");
        const alreadySaved = savedWishlist.some(item => item.id === id);
        const product = products.find(item => item.id === id);
        const updatedWishlist = alreadySaved
            ? savedWishlist.filter(item => item.id !== id)
            : [...savedWishlist, product];

        localStorage.setItem("shopstack-wishlist", JSON.stringify(updatedWishlist));
        window.dispatchEvent(new Event("wishlistUpdated"));

        if (alreadySaved) {

            setWishlist(wishlist.filter(item => item !== id));

        } else {

            setWishlist([...wishlist, id]);

        }

    }

    async function reserveProduct(product, quantity = 1) {
        const latestResponse = await fetch("http://localhost:8080/api/products");
        if (latestResponse.ok) {
            const latestProducts = await latestResponse.json();
            product = latestProducts.find(item => item.id === product.id) || product;
        }

        if (Number(product.stock || 0) < quantity) {
            throw new Error(`${product.name} has only ${product.stock || 0} item(s) available`);
        }

        const response = await fetch("http://localhost:8080/api/products/reserve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ productId: product.id, quantity }])
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Stock update failed (${response.status}). Restart the backend and try again.`);
        }
    }

    async function addToCart(product) {

        const availableStock = Number(product.stock || 0);
        const savedCart = JSON.parse(localStorage.getItem("shopstack-cart") || "[]");
        const existingProduct = savedCart.find(item => item.id === product.id);

        if (availableStock < 1) {
            alert("This product is currently unavailable");
            return;
        }

        try {
            await reserveProduct(product);
        } catch (error) {
            alert(error.message);
            fetchProducts();
            return;
        }

        const updatedCart = existingProduct
            ? savedCart.map(item => item.id === product.id
                ? { ...item, quantity: item.quantity + 1, stock: Math.max(0, Number(item.stock ?? availableStock) - 1) }
                : item
            )
            : [...savedCart, { ...product, price: salePrice(product), originalPrice: Number(product.price), quantity: 1, stock: Math.max(0, availableStock - 1) }];

        localStorage.setItem("shopstack-cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
        setProducts(items => items.map(item => item.id === product.id ? { ...item, stock: Number(item.stock) - 1 } : item));
        window.dispatchEvent(new Event("productsUpdated"));
        alert(`${product.name} added to cart`);

    }

    async function buyNow(product) {
        try {
            const savedCart = JSON.parse(localStorage.getItem("shopstack-cart") || "[]");

            // Buy Now means this product alone. Release reservations held by
            // the previous cart before reserving the selected product.
            if (savedCart.length > 0) {
                const releaseResponse = await fetch("http://localhost:8080/api/products/release", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(savedCart.map(item => ({ productId: item.id, quantity: item.quantity })))
                });
                if (!releaseResponse.ok) throw new Error("Unable to reset the current cart");
            }

            const latestResponse = await fetch("http://localhost:8080/api/products");
            const latestProducts = latestResponse.ok ? await latestResponse.json() : [];
            const latestProduct = latestProducts.find(item => item.id === product.id) || product;
            if (Number(latestProduct.stock || 0) < 1) throw new Error("This product is currently unavailable");

            await reserveProduct(latestProduct);
            const remainingStock = Number(latestProduct.stock) - 1;
            const updatedCart = [{
                ...latestProduct,
                price: salePrice(latestProduct),
                originalPrice: Number(latestProduct.price),
                quantity: 1,
                stock: Math.max(0, remainingStock)
            }];

            localStorage.setItem("shopstack-cart", JSON.stringify(updatedCart));
            window.dispatchEvent(new Event("cartUpdated"));
            window.dispatchEvent(new Event("productsUpdated"));
            navigate("/customer/checkout");
        } catch (error) {
            alert(error.message);
            fetchProducts();
        }
    }

    const categories = useMemo(() => {

        const list = products.map(p => p.category);

        return ["All", ...new Set(list)];

    }, [products]);

    const filteredProducts = products.filter(product => {

        const matchSearch =
            product.name.toLowerCase().includes(search.toLowerCase());

        const matchCategory = category === "All"
            || (category.toLowerCase() === "laptop"
                ? product.category?.toLowerCase().includes("laptop")
                : product.category === category);

        const matchStock = !inStockOnly || Number(product.stock || 0) > 0;

        return matchSearch && matchCategory && matchStock;

    });

    return (

        <div className="browse-page">

            <section className="browse-header">

                <div>

                    <h1>Discover Amazing Products</h1>

                    <p>
                        Shop premium quality products from trusted vendors.
                    </p>

                </div>

            </section>

            <div className="top-toolbar">

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                <div className="select-wrapper">

                    <FaStore className="select-icon" />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >

                        {categories.map(cat => (

                            <option key={cat}>
                                {cat}
                            </option>

                        ))}

                    </select>

                </div>

            </div>

            <div className="results-row">

                <h3>

                    {filteredProducts.length} Products Found

                </h3>

            </div>

            <div className="browse-grid">

                {filteredProducts.length === 0 ? (

                    <div className="empty-box">

                        <FaShoppingBag size={70} />

                        <h2>No Products Found</h2>

                        <p>
                            Try changing your search or category.
                        </p>

                    </div>

                ) : (

                    filteredProducts.map(product => (

                        <div
                            className="browse-card"
                            key={product.id}
                        >

                            {discountPercent(product) > 0 && <span className="discount-badge">{discountPercent(product)}% OFF</span>}

                            {

                                product.imageUrl &&
                                    product.imageUrl.trim() !== ""

                                    ?

                                    <div className="browse-card-image">
                                        <img
                                            className="browse-card-product-image"
                                            src={product.imageUrl}
                                            alt={product.name}
                                            onError={(event) => {
                                                event.currentTarget.style.display = "none";
                                                event.currentTarget.parentElement.classList.add("image-unavailable");
                                            }}
                                        />
                                    </div>

                                    :

                                    <div className="browse-card-image image-unavailable" />

                            }


                            <div className="browse-content">

                                <div className="title-row">

                                    <div className="title-left">

                                        <h2>

                                            {product.name}

                                        </h2>

                                    </div>

                                    <button

                                        className="wishlist-btn"

                                        onClick={() => toggleWishlist(product.id)}

                                        aria-label="Toggle wishlist"

                                    >

                                        {wishlist.includes(product.id) ? <FaHeart /> : <FaRegHeart />}

                                    </button>

                                </div>

                                <p className="description">

                                    {product.description}

                                </p>

                                <div className="price-row">

                                    <span className="price">

                                        ₹{salePrice(product).toLocaleString()}

                                    </span>
                                    {discountPercent(product) > 0 && <del>₹{Number(product.price).toLocaleString()}</del>}

                                </div>

                                <div className="category-pill">

                                    {product.category}

                                </div>

                                <div className={`stock-status ${Number(product.stock || 0) > 0 ? "in-stock" : "out-of-stock"}`}>
                                    {Number(product.stock || 0) > 0
                                        ? `${product.stock} available`
                                        : "Unavailable"}
                                </div>

                                <div className="button-group">

                                    <button
                                        className="cart-btn"
                                        onClick={() => addToCart(product)}
                                        disabled={Number(product.stock || 0) < 1}
                                    >

                                        <FaShoppingCart />

                                        Add To Cart

                                    </button>

                                    <button className="buy-btn" onClick={() => buyNow(product)} disabled={Number(product.stock || 0) < 1}>

                                        <FaBolt />

                                        Buy Now

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}

export default BrowseProducts;
