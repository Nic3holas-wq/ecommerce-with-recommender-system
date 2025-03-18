import React, { useEffect, useState } from "react";
import "./Products.css";
import Navigation from "../Navigation/Navigation";
import SearchBar from "../SearchBar/SearchBar";
import Footer from "../Footer/Footer";
import Product from "../Product/Product";
const Products = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const storedRecommendations = JSON.parse(localStorage.getItem("recommendedProducts")) || [];


    useEffect(() => {
        // Fetch all products from the backend
        fetch("http://10.42.0.1:5000/all-products") // Change this to your actual API endpoint
            .then(response => response.json())
            .then(data => setAllProducts(data))
            .catch(error => console.error("Error fetching all products:", error));
    }, []);

    useEffect(() => {
            if (searchQuery) {
                setIsTyping(true);
                const timeout = setTimeout(() => {
                    fetch(`http://10.42.0.1:5000/recommend?query=${searchQuery}`)
                        .then(response => response.json())
                        .then(data => {
                            const recommendations = Array.isArray(data) && data.length > 0 ? data : [];
                            setRecommendedProducts(recommendations);
                            setIsTyping(false);
        
                            // Save recommendations to localStorage
                            localStorage.setItem("recommendedProducts", JSON.stringify(recommendations));
                        })
                        .catch(error => {
                            console.error("Error fetching recommendations:", error);
                            setIsTyping(false);
                        });
                }, 500); // Delay to optimize API calls
        
                return () => clearTimeout(timeout);
            } else {
                // Show recently viewed when there's no search
                if(!storedRecommendations){
                    setRecommendedProducts(recentlyViewed);
                } else{
                    setRecommendedProducts(storedRecommendations)
                }
                
                setIsTyping(false);
            }
        }, [searchQuery, recentlyViewed]);

    return (
        <div>
            <Navigation />
            <SearchBar onSearch={(query) => setSearchQuery(query)}/>

            <div className="top-products">
                <p>Recommended for You</p>
                <div className="products">
                    {isTyping ? (
                        recentlyViewed.length > 0 ? (
                            recentlyViewed.map(product => <Product key={product.id} product={product} />)
                        ) : (
                            <p>No recently viewed products.</p>
                        )
                    ) : recommendedProducts.length > 0 ? (
                        recommendedProducts.map(product => <Product key={product.id} product={product} />)
                    ) : (
                        <p>No recommendations found.</p>
                    )}
                </div>
            </div>

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
