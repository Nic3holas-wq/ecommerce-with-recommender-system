import React, { useState } from "react";
import "./Contact.css";
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully! Please wait for an email");
  };

  return (
    <div>
      <Navigation />
      <div className="contact-container">
        <h2>Contact Us</h2>
        <p>Have a question? Send us a message!</p>

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Your Email" onChange={handleChange} required />
          <textarea name="message" placeholder="Your Message" rows="5" onChange={handleChange} required></textarea>
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
    </div>
  );
};

export default Contact;
