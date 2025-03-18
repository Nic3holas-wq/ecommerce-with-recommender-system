import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup, signOut } from "../../firebaseConfig";
import { GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './Login.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            navigate("/home"); // Redirect to home if logged in
        }
    }, [navigate]); // Add navigate to dependencies

    // Sign in with Google
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            // Save user details in local storage
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);
            console.log("User Info:", user);

            // Show success toast and navigate to home
            toast.success("You have Successfully Logged in!", {
                position: "top-center",
                autoClose: 2000,
                theme: "colored",
            });

            setTimeout(() => {
                navigate("/home");
            }, 2500);
        } catch (error) {
            console.error("Login Error:", error.message);
        }
    };

    // Logout
    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <div>
            <div className="login-container" style={{ textAlign: "center", marginTop: "50px" }}>
                {user ? (
                    <div className="user-details">
                        <h2>Welcome, {user.displayName}!</h2>
                        <img src={user.photoURL} alt="User Profile" style={{ borderRadius: "50%", width: "100px" }} />
                        <p>Email: {user.email}</p>
                        <button onClick={handleLogout} style={{ padding: "10px", background: "red", color: "#fff", border: "none", cursor: "pointer" }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="login-form">
                        <h2>Ecommerce</h2>
                        <h3>Welcome!</h3>
                        <p>Login</p>
                        <button onClick={handleGoogleLogin}>
                            <img src="google-icon.png" alt="Google" />
                            <span>Sign in with Google</span>
                        </button>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;
