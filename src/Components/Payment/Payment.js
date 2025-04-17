import React, { useState, useEffect } from "react";
import "./Payment.css";
import { toast, ToastContainer } from "react-toastify";
import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

const Payment = () => {
  const [phone, setPhone] = useState("");
  const [pickupStation, setPickupStation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState([]);
  // const [phoneNumber, setPhoneNumber] = useState("+254746982439");
  // const [textmessage, settextMessage] = useState("Hello good afternoon");
  // const [response, setResponse] = useState("");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedUser = JSON.parse(localStorage.getItem("user")) || [];

    setUser(storedUser);
    setCartItems(storedCart);
  }, []);


  // const sendSMS = async (e) => {
  //   e.preventDefault();

  //   if (!phoneNumber || !textmessage) {
  //       toast.error("Please enter a phone number and message");
  //       return;
  //   }

  //   try {
  //     const res = await axios.post("http://127.0.0.1:5000/send_sms", {
  //       to: phoneNumber,
  //       message: textmessage,
  //     });

  //     setResponse(res.data.message);
  //     toast.success("SMS sent successfully!");
  //   } catch (error) {
  //     const errorMsg = error.response?.data?.error || "Failed to send SMS";
  //     setResponse("Error: " + errorMsg);
  //     toast.error(errorMsg);
  //   }
  // };


  //function to send email to the user
  const sendCartEmail = async () => {
    const user = JSON.parse(localStorage.getItem("user")); // Get user info
    const recipientEmail = user?.email; // Extract email from user data

    if (!recipientEmail) {
        toast.error("No recipient email found. Please log in.", {
            position: "top-center",
            autoClose: 4000,
            theme: "colored",
        });
        return;
    }

    if (cartItems.length === 0) {
        toast.warning("Your cart is empty!", {
            position: "top-center",
            autoClose: 4000,
            theme: "colored",
        });
        return;
    }

    const emailData = {
        recipient: recipientEmail,
        subject: "Your Ecommerce Order Details",
        message: `Dear ${user.displayName}, Here are the items that you have ordered:\n\n${cartItems.map(item =>
            `- ${item.name} (Quantity: ${item.quantity}) - Ksh ${item.price}`
        ).join("\n")}\n\nTotal Price: Ksh ${totalPrice.toLocaleString()},\n\n You will pick up your order at ${pickupStation} after 3 days.\n\n Regards Ecommerce Shopping Team.\n Thank You For Your Order.`
    };

    try {
        const response = await fetch("http://127.0.0.1:5000/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(emailData)
        });

        const data = await response.json();
        if (response.ok) {
            toast.success("Your Order has been placed, please check an email has been sent to you.", {
                position: "top-center",
                autoClose: 4000,
                theme: "colored",
            });
        } else {
            toast.error(`Error: ${data.error}`, {
                position: "top-center",
                autoClose: 4000,
                theme: "colored",
            });
        }
    } catch (error) {
        toast.error("Failed to send email. Please try again.", {
            position: "top-center",
            autoClose: 4000,
            theme: "colored",
        });
    }
};

  const pickupStations = [
    "Nairobi CBD", "Westlands", "Thika", "Mombasa",
    "Eldoret", "Kisumu", "Embu", "Meru", "Siaya",
    "Nyeri", "Karatina"
  ];

  // Format phone number
  const formatPhoneNumber = (input) => {
    if (input.startsWith("07") || input.startsWith("01")) {
      return "254" + input.slice(1);
    }
    return input;
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
 
  const pollPaymentStatus = async (checkoutRequestID, retries = 10, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait before checking
  
      try {
        const response = await fetch(`http://127.0.0.1:5000/payment/status/${checkoutRequestID}`);
        const data = await response.json();
  
        if (data.status === "success") {
          toast.success("Payment successful!", {
            position: "top-center",
            autoClose: 4000,
            theme: "colored",
          });
          sendCartEmail();
          return;
        } else if (data.status === "failed") {
          toast.error("Payment canceled!. Please try again.", {
            position: "top-center",
            autoClose: 4000,
            theme: "colored",
          });
          return;
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }
  
    toast.error("Payment confirmation timeout. Please try again.", {
      position: "top-center",
      autoClose: 4000,
      theme: "colored",
    });
  };
  
  const handlePayment = async () => {
    const formattedPhone = formatPhoneNumber(phone);
  
    if (!formattedPhone.match(/^254(7|1)\d{8}$/)) {
      toast.error("Enter a valid M-Pesa number (07XXXXXXXX or 01XXXXXXXX)", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
      return;
    }
  
    if (!pickupStation) {
      toast.error("Please select a pickup station.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    try {
      const response = await fetch("http://127.0.0.1:5000/payment/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: 1,
          pickupStation: pickupStation,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.ResponseCode === "0") {
        toast.success("STK Push request sent. Check your phone!", {
          position: "top-center",
          autoClose: 4000,
          theme: "colored",
        });
  
        // Start polling for payment confirmation
        pollPaymentStatus(data.CheckoutRequestID);
      } else {
        toast.error("Payment request failed. Please check the number you entered.", {
          position: "top-center",
          autoClose: 4000,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Error processing payment.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
    }
  
    setLoading(false);
  };
  
  

  return (
    <div>
      <h2 style={{color:"rgba(0,0,0,0.9)"}}>Please Do Not Refresh This Page! This Will Alter the Transaction Process</h2>
      <h3 style={{color:"rgba(0,0,0,0.7)", textAlign:"center"}}>Also note that this page will not ask for your Mpesa PIN. Please take care.</h3>

      <div className="payment-container">
        
        {/* Shopping List - Table Format */}
        <div className="shopping-list">
          <h3>Shopping List</h3>
          {cartItems.length > 0 ? (
            <table className="shopping-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price (Ksh)</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2"><strong>Total</strong></td>
                  <td><strong>Ksh {totalPrice.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p>No items in the cart</p>
          )}
        </div>


        {/* Payment Form */}
        <div className="payment-form">
          <h2>M-Pesa Payment</h2>
          <input
            type="text"
            placeholder="Enter Mpesa Number (07XXXXXXXX or 01XXXXXXXX)"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Pickup Station Dropdown */}
          <select value={pickupStation} onChange={(e) => setPickupStation(e.target.value)} required>
            <option value="">Select Pickup Station</option>
            {pickupStations.map((station, index) => (
              <option key={index} value={station}>{station}</option>
            ))}
          </select>

          <button onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay with M-Pesa"}
          </button>

          {message && <p>{message}</p>}
        </div>

      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Payment;
