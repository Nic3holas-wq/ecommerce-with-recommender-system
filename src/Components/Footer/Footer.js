import React from "react";

const Footer = () => {
  return (
    <footer style={{ 
      position: "relative", 
      bottom: 0, 
      fontWeight: "bold",
      width: "100%", 
      textAlign: "center", 
      padding: "10px", 
      background: "rgb(9,243, 17)", 
      color: "white" 
    }}>
      © {new Date().getFullYear()} All rights reserved.
    </footer>
  );
};

export default Footer;
