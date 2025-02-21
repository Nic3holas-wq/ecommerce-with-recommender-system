import React, { useState, useEffect } from "react";
import './Cart.css';
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";
import Product from "../Product/Product";

const Cart = () => {
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [savedRecentlyViewed, setRecentlyViewed] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart items from localStorage
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedRecommendations = JSON.parse(localStorage.getItem("recommendedProducts")) || [];
    const storedRecentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    setCartItems(storedCart);
    setSavedRecommendations(storedRecommendations);
    setRecentlyViewed(storedRecentlyViewed);
  }, []);

  // Function to remove an item from cart
  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update storage
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

            <button className="checkout-btn">Continue to Checkout</button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
