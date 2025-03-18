import React, { useState, useEffect } from "react";
import { auth, signOut } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import './Account.css'
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import Product from "../Product/Product";

const Account = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [savedRecommendations, setSavedRecommendations] = useState([]);
    const [savedRecentlyViewed, setRecentlyViewed] = useState([]);
    const [cartItems, setCartItems] = useState([]);

    // Load user data from localStorage when the component mounts
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        } else {
            navigate("/"); // Redirect to login if no user is found
        }
    }, [navigate]);

    useEffect(() => {
        // Load cart items from localStorage
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const storedRecommendations = JSON.parse(localStorage.getItem("recommendedProducts")) || [];
        const storedRecentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    
        setCartItems(storedCart);
        setSavedRecommendations(storedRecommendations);
        setRecentlyViewed(storedRecentlyViewed);
      }, []);

    // Logout function
const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);

    toast.success("You have been Logged Out!", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
    });

    // Delay navigation to allow toast to be visible
    setTimeout(() => {
        navigate("/"); // Redirect to login after 2.5 seconds
    }, 2500); // Adjust time slightly longer than toast duration
};


    return (
        <div>
            <Navigation/>
            <div className="account-container" >
            {user ? (
                <div className="user-details">
                    <h2>Account Details</h2>
                    <img src={user.photoURL} alt="Profile" style={{ borderRadius: "50%", width: "120px" }} />
                    <h3>{user.displayName}</h3>
                    <p>Email: {user.email}</p>
                    <p>PhoneNumber: {user.phoneNumber || "Not provided"}</p>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                    <p style={{ fontSize: "21px", textAlign: "center", fontWeight: "bold" }}>
              Products Suggested For You
            </p>

            {/* Recommended Products Section */}
            <div className="recommended-products">
              {savedRecommendations.length > 0 ? (
                savedRecommendations.map((product) => (
                  <Product key={product.id} product={product} />
                ))
              ) : (
                <p>No recommendations available.</p>
              )}
            </div>

            <p style={{ fontSize: "21px", textAlign: "center", fontWeight: "bold" }}>
              Products You Recently Viewed
            </p>

            {/* Recommended Products Section */}
            <div className="recommended-products">
              {savedRecentlyViewed.length > 0 ? (
                savedRecentlyViewed.map((product) => (
                  <Product key={product.id} product={product} />
                ))
              ) : (
                <p>No recommendations available.</p>
              )}
            </div>
                </div>
            ) : (
                <p>Loading user details...</p>
            )}
        </div>
        <Footer/>
        <ToastContainer/>
        </div>
        
    );
};

export default Account;
