import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";

const Navigation = () => {
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Retrieve cart items from localStorage
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const user = JSON.parse(localStorage.getItem("user")) || []
        setUser(user)
        setCartCount(storedCart.length);
    }, []);

    return (
        <header className="bg-blue-600 text-white p-3 shadow-md">
          <nav className="container mx-auto flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center space-x-1 ml-1">
              <h1 className="text-lg font-bold">E-commerce</h1>
            </div>
            {user ?(
              <div className="user">
              <img src={user.photoURL} alt="Profile"/>
              <span>{user.displayName}</span>
            </div>

            ):(
              <p></p>
            )}
            
            {/* Navigation Links */}
            <ul className="flex space-x-8">
              <li>
                <Link to="/home" className={`nav-link ${location.pathname === "home" ? "active" : ""}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className={`nav-link ${location.pathname === "/products" ? "active" : ""}`}>
                  Products
                </Link>
              </li>
              <li>
                <Link to="/account" className={`nav-link ${location.pathname === "/account" ? "active" : ""}`}>
                  Account
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/cart" className="cart">
                  <Badge badgeContent={cartCount} color="error">
                    <ShoppingCartIcon className="cart-icon" style={{ fontSize: "40px"}} />
                  </Badge>
                </Link>
              </li>
            </ul>
          </nav>
        </header>
    );
}

export default Navigation;
