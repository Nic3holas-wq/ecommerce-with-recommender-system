import React, { useState, useEffect } from "react";
import "./Contact.css";
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";
import { toast, ToastContainer } from "react-toastify";

const Contact = () => {
  // Load user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const [user, setUser] = useState({});

  // Set user state only once after the component mounts
  useEffect(() => {
    setUser(storedUser);
  }, []);

  const [formData, setFormData] = useState({
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user.email) {
      alert("Error: No recipient email found!");
      return;
    }
  
    const emailData = {
      recipient: user.email, // Ensure this exists
      subject: `New message from ${user.displayName || "User"}`, // Subject with user name
      message: formData.message, // Message content
    };
  
    try {
      const response = await fetch("http://127.0.0.1:5000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast.success("Message sent successfully!", {
              position: "top-center",
              autoClose: 4000,
              theme: "colored",
            });

        setFormData({ message: "" }); // Clear only the message field
      } else {
        toast.error(`Error: ${data.error}`, {
          position: "top-center",
          autoClose: 4000,
          theme: "colored",
        });
        
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send the message. Please try again.");
      toast.error("Failed to send the message. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
    }
  };
  

  return (
    <div>
      <Navigation />
      <div className="contact-container">
        <h2>Contact Us</h2>
        <p>Have a question? Send us a message!</p>

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit">Send Message</button>
        </form>

        {/* Contact Details */}
        <div className="contact-info">
          <p><strong>📞 Phone:</strong> +254 700 123 456</p>
          <p><strong>📧 Email:</strong> info@yourwebsite.com</p>
          <p><strong>🏢 Address:</strong> Nairobi, Kenya</p>
        </div>

        {/* Social Media Links */}
        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
      <Footer />
      <ToastContainer/>
    </div>
  );
};

export default Contact;
