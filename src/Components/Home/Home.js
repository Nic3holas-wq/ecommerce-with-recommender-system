import React, { useEffect, useState } from "react";
import "./Home.css";
import Navigation from "../Navigation/Navigation";
import SearchBar from "../SearchBar/SearchBar";
import Product from "../Product/Product";
import Footer from "../Footer/Footer";

const Home = () => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const storedRecommendations = JSON.parse(localStorage.getItem("recommendedProducts")) || [];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const firstFiveResponse = await fetch("http://10.42.0.1:5000/first-five");
                const firstFiveData = await firstFiveResponse.json();
                

                const topProductsResponse = await fetch("http://10.42.0.1:5000/all-products");
                const topProductsData = await topProductsResponse.json();
                setTopProducts(topProductsData.slice(0, 5));

                const storedRecentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
                setRecentlyViewed(storedRecentlyViewed);
                if(!storedRecommendations){
                    setRecommendedProducts(storedRecentlyViewed);
                } else{
                    setRecommendedProducts(storedRecommendations)
                }
                
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
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
            <SearchBar onSearch={(query) => setSearchQuery(query)} />

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
                <p>Top Products</p>
                <div className="products">
                    {topProducts.length > 0 ? (
                        topProducts.map(product => <Product key={product.id} product={product} />)
                    ) : (
                        <p>No top products available.</p>
                    )}
                </div>
            </div>

            {recentlyViewed.length > 0 && (
                <div className="top-products">
                    <p>Recently Viewed</p>
                    <div className="products">
                        {recentlyViewed.map(product => <Product key={product.id} product={product} />)}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Home;
