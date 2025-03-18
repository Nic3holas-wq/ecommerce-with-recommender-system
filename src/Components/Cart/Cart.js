import React, { useState, useEffect } from "react";
import './Cart.css';
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";
import Product from "../Product/Product";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Cart = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [savedRecentlyViewed, setRecentlyViewed] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState([])

  useEffect(() => {
    // Load cart items from localStorage
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedUser = JSON.parse(localStorage.getItem("user")) || [];
    const storedRecommendations = JSON.parse(localStorage.getItem("recommendedProducts")) || [];
    const storedRecentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    setUser(storedUser)
    setCartItems(storedCart);
    setSavedRecommendations(storedRecommendations);
    setRecentlyViewed(storedRecentlyViewed);
  }, []);

  const removeItem = (id) => {
    const productToRemove = cartItems.find((item) => item.id === id);
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update storage

    if (productToRemove) {
        toast.success(`✅ ${productToRemove.name} removed from cart`, {
            position: "top-center",
            autoClose: 4000,
            theme: "colored",
        });
    }
};


  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  //function to send email to the user
  const sendCartEmail = async () => {
    navigate('/payment')
    // const user = JSON.parse(localStorage.getItem("user")); // Get user info
    // const recipientEmail = user?.email; // Extract email from user data

    // if (!recipientEmail) {
    //     toast.error("No recipient email found. Please log in.", {
    //         position: "top-center",
    //         autoClose: 4000,
    //         theme: "colored",
    //     });
    //     return;
    // }

    // if (cartItems.length === 0) {
    //     toast.warning("Your cart is empty!", {
    //         position: "top-center",
    //         autoClose: 4000,
    //         theme: "colored",
    //     });
    //     return;
    // }

    // const emailData = {
    //     recipient: recipientEmail,
    //     subject: "Your Ecommerce Order Details",
    //     message: `Dear ${user.displayName}, Here are the items that you have ordered:\n\n${cartItems.map(item =>
    //         `- ${item.name} (Quantity: ${item.quantity}) - Ksh ${item.price}`
    //     ).join("\n")}\n\nTotal Price: Ksh ${totalPrice.toLocaleString()},\n\n Regards Ecommerce Shopping Team.\n Thank You For Your Order.`
    // };

    // try {
    //     const response = await fetch("http://127.0.0.1:5000/send-email", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify(emailData)
    //     });

    //     const data = await response.json();
    //     if (response.ok) {
    //         toast.success("Cart details sent successfully!", {
    //             position: "top-center",
    //             autoClose: 4000,
    //             theme: "colored",
    //         });
    //     } else {
    //         toast.error(`Error: ${data.error}`, {
    //             position: "top-center",
    //             autoClose: 4000,
    //             theme: "colored",
    //         });
    //     }
    // } catch (error) {
    //     toast.error("Failed to send email. Please try again.", {
    //         position: "top-center",
    //         autoClose: 4000,
    //         theme: "colored",
    //     });
    // }
};

  return (
    <div>
      <Navigation />
      <div className="cart-container">
        <h2>Shopping Cart</h2>

        {/* Check if cart is empty */}
        {cartItems.length === 0 ? (
          <div>
            <p className="empty-cart-message">You’ve no items selected.</p>
            <p style={{ fontSize: "21px", textAlign: "center", fontWeight: "bold" }}>
              Products You Might Like
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
              Recently Viewed Products
            </p>
            <div className="recommended-products">
              {savedRecentlyViewed.length > 0 ? (
                savedRecentlyViewed.map((product) => (
                  <Product key={product.id} product={product} />
                ))
              ) : (
                <p>No recently viewed products.</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Price (Ksh)</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img src={item.image_url} alt={item.name} className="cart-image" />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.price.toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Total Price Row */}
                <tr className="total-row">
                  <td colSpan="3"></td>
                  <td><strong>Total:</strong></td>
                  <td><strong>Ksh {totalPrice.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>

            
            <button onClick={sendCartEmail} className="checkout-btn">Continue to Checkout</button>
          </>
        )}
      </div>
      <Footer />
      <ToastContainer/>
    </div>
  );
}

export default Cart;
