import React from "react";
import "./Product.css";
import { Link } from "react-router-dom";

const Product = ({ product }) => {
    const handleClick = () => {
        let viewedProducts = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

        // Avoid duplicates
        if (!viewedProducts.find(p => p.id === product.id)) {
            viewedProducts.unshift(product); // Add new product at the beginning
            if (viewedProducts.length > 5) viewedProducts.pop(); // Keep only last 5
            localStorage.setItem("recentlyViewed", JSON.stringify(viewedProducts));
        }
    };

    return (
        <div className="product-link">
            <Link 
                to={`/productinfo/${product.id}`} 
                style={{ textDecoration: "none", color: "inherit" }}
                onClick={handleClick}  // Track product clicks
            >
                <div className="product">
                    <img
                        className="product-image"
                        width={150}
                        src={product.image_url || "default-image.png"}
                        alt={product.name}
                    />
                    <span className="name">{product.name}</span>
                    <span className="desc">{product.description}</span>
                    <span className="price">Ksh {product.price}</span>
                </div>
            </Link>
        </div>
    );
};

export default Product;
