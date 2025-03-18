import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductInfo.css";
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const ProductInfo = () => {
    const { id } = useParams(); // Extract product ID from URL
    const navigate = useNavigate(); // Navigation hook
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdded, setIsAdded] = useState(false);
    const [savedRecommendations, setSavedRecommendations] = useState([]);
    const [savedRecentlyViewed, setRecentlyViewed] = useState([]);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
                const storedRecommendations = JSON.parse(localStorage.getItem("recommendedProducts")) || [];
                const storedRecentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
                setCartItems(storedCart);
                setSavedRecommendations(storedRecommendations);
                setRecentlyViewed(storedRecentlyViewed);

                const response = await fetch(`http://10.42.0.1:5000/product/${id}`);
                if (!response.ok) {
                    throw new Error("Product not found");
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Function to remove an item from cart
  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update storage

    toast.success("You have canceled the operation!", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
  };

    // Function to Add to Cart
    const addToCart = () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Check if the product is already in cart
        const existingProduct = cart.find((item) => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1; // Increase quantity if already added
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        setIsAdded(true);
        //Show toast message
        toast.success(
            <div>
                Item Successfully Added to Cart! 
                <button 
                    onClick={() => removeItem(product.id)} 
                    style={{ marginLeft: "10px", color: "blue", border: "none", background: "none", cursor: "pointer" }}
                >
                    Undo
                </button>
            </div>, 
            { position: "top-center", autoClose: 4000, theme: "colored" }
        );
        
    };

    

    if (loading) return <p>Loading product details...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div>
            <Navigation />

            <div className="product-container">
                <div className="product-div">
                    <div className="product-image">
                        <img src={product.image_url} alt={product.name} />
                    </div>

                    <div className="product-details">
                        <span className="name">{product.name}</span>
                        <span className="desc">{product.description}</span>
                        <span className="price">Ksh {product.price.toLocaleString()}</span>
                        <span className="cut-price">Ksh {(product.cutPrice || (product.price * 1.25)).toLocaleString()}</span>
                        <p style={{ color: "#59FF00" }}>In Stock</p>
                    </div>
                </div>

                <div className="add-cart-button">
                    {isAdded ? (
                        <button onClick={() => navigate("/cart")} style={{ background: "#28a745" }}>
                            <ShoppingCartIcon style={{ fontSize: "40px" }} /> Go to Cart
                        </button>
                    ) : (
                        <button onClick={addToCart}>
                            <ShoppingCartIcon style={{ fontSize: "40px" }} /> Add to Cart
                        </button>
                    )}
                </div>

                <div className="product-information">
                    <h3 style={{ fontSize: "25px" }}>Product Information</h3>
                    <p>{product.description || "No additional details available."}</p>
                </div>
            </div>

            <Footer />
            <ToastContainer />
        </div>
    );
};

export default ProductInfo;
