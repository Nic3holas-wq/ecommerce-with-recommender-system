import React, { useEffect, useState } from "react";
import "./Products.css";
import Navigation from "../Navigation/Navigation";
import SearchBar from "../SearchBar/SearchBar";
import Footer from "../Footer/Footer";
import Product from "../Product/Product";

const Products = () => {
    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        // Fetch all products from the backend
        fetch("http://127.0.0.1:5000/all-products") // Change this to your actual API endpoint
            .then(response => response.json())
            .then(data => setAllProducts(data))
            .catch(error => console.error("Error fetching all products:", error));
    }, []);

    return (
        <div>
            <Navigation />
            <SearchBar />

            <div className="top-products">
                <p>All Products</p>
                <div className="products">
                    {allProducts.map(product => (
                        <Product key={product.id} product={product} />
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Products;
