import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from gensim.models import Word2Vec
from flask_cors import CORS
from rapidfuzz import process, fuzz
from flask_mail import Mail, Message
import os
import base64
import requests
from datetime import datetime
import africastalking

# Load dataset
df = pd.read_csv("./Dataset.csv")

# Ensure `id` remains as an integer
df["id"] = df["id"].astype(int)

# Convert descriptions into tokenized lists
df["tokenized_desc"] = df["description"].apply(lambda x: str(x).lower().split())

# Train or Load Word2Vec Model
MODEL_PATH = "word2vec_recommendation.model"
try:
    word2vec_model = Word2Vec.load(MODEL_PATH)  # Load pre-trained model
except:
    word2vec_model = Word2Vec(sentences=df["tokenized_desc"], vector_size=100, window=5, min_count=1, workers=4)
    word2vec_model.save(MODEL_PATH)  # Save model for future use

# Flask API setup
app = Flask(__name__)
CORS(app)

# Africa's Talking API Credentials
USERNAME = "sandbox"  # Use "sandbox" for testing or your app username in production
API_KEY = "atsk_517d27a3e31be4ee7a41b2a019b062e0af63e60b2d6414206a4a020e5dad48afbb67cd4b"  # Replace with your API key

# Initialize Africa's Talking
africastalking.initialize(USERNAME, API_KEY)
sms = africastalking.SMS

@app.route("/send_sms", methods=["POST"])
def send_sms():
    try:
        data = request.get_json()
        phone_number = data.get("to")  # Get recipient's phone number
        message = data.get("message")  # Get message text
        print(data)
        if not phone_number or not message:
            return jsonify({"error": "Phone number and message are required"}), 400

        # Send SMS
        response = sms.send(message, [phone_number])

        return jsonify({"message": "SMS sent successfully!", "response": response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




# In-memory database to store payment statuses (Replace with DB in production)
payment_status = {}

# Flask-Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = "nicholasmurimi254@gmail.com"  # Use environment variables
app.config['MAIL_PASSWORD'] = "fuabzrnnuzehxvqh"  # Use environment variables
app.config['MAIL_USE_TLS'] = False  
app.config['MAIL_USE_SSL'] = True  
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']  # Set default sender

mail = Mail(app)

@app.route("/send-email", methods=["POST"])
def send_email():
    try:
        data = request.get_json()
        recipient = data.get("recipient")
        subject = data.get("subject")
        message_body = data.get("message")

        if not recipient or not subject or not message_body:
            return jsonify({"error": "Missing required fields"}), 400

        msg = Message(
            subject=subject,
            sender=app.config['MAIL_USERNAME'],  # Explicitly specify sender
            recipients=[recipient],  
            body=message_body
        )
        mail.send(msg)
        return jsonify({"message": "Email sent successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# M-Pesa API credentials
# Safaricom MPESA credentials
CONSUMER_KEY = "QGaxjls5hBgmsKtpvv4cq8H8Axilo5Ax3Q9vnxm6BTxrn7bD"
CONSUMER_SECRET = "4hDp8S8qAbn8HP3B6BD8BV3Gbr26G6xjB525fSuAhtUDXwGA0tyWm2ssJrlUF0Cz"
SHORTCODE = "174379"
PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
CALLBACK_URL = "https://bb30-41-209-10-178.ngrok-free.app/confirmation"

# Function to get access token
def get_access_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
    return response.json().get("access_token")

# STK Push Payment
@app.route("/payment/stkpush", methods=["POST"])
def stk_push():
    data = request.json
    phone = data.get("phone")
    amount = data.get("amount")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode((SHORTCODE + PASSKEY + timestamp).encode()).decode()
    
    access_token = get_access_token()
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    stk_push_payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "Order123",
        "TransactionDesc": "E-commerce Payment"
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=stk_push_payload,
        headers=headers,
    )

    data = response.json()
    checkout_request_id = data.get("CheckoutRequestID")

    # Store initial status as "pending"
    payment_status[checkout_request_id] = {"status": "pending"}

    return jsonify({
        "ResponseCode": data.get("ResponseCode"),
        "CustomerMessage": data.get("CustomerMessage"),
        "CheckoutRequestID": checkout_request_id
    })


# ✅ **NEW: Handle Safaricom STK Callback Response**
@app.route("/payment/callback", methods=["POST"])
def payment_callback():
    try:
        data = request.json
        print("🔹 Received Callback Data:", data)  # Debugging
        
        if not data:
            return jsonify({"error": "Empty request"}), 400

        # Extract required details
        stk_callback = data.get("Body", {}).get("stkCallback", {})
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")
        checkout_request_id = stk_callback.get("CheckoutRequestID")

        if result_code is None:
            return jsonify({"error": "Invalid STK callback format"}), 400

        if result_code == 0:
            # Payment was successful
            callback_metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])

            # Extract metadata values
            amount = next((item["Value"] for item in callback_metadata if item["Name"] == "Amount"), None)
            mpesa_receipt_number = next((item["Value"] for item in callback_metadata if item["Name"] == "MpesaReceiptNumber"), None)
            phone_number = next((item["Value"] for item in callback_metadata if item["Name"] == "PhoneNumber"), None)

            # Save transaction details
            transaction_details = {
                "status": "Success",
                "message": "Payment received",
                "amount": amount,
                "mpesa_receipt": mpesa_receipt_number,
                "phone": phone_number
            }
            print("✅ Payment Success:", transaction_details)
        else:
            # Payment failed or canceled
            transaction_details = {
                "status": "Failed",
                "message": result_desc,
                "checkout_request_id": checkout_request_id
            }
            print("❌ Payment Failed:", transaction_details)

        return jsonify(transaction_details)

    except Exception as e:
        print("⚠️ Error in callback handling:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route("/confirmation", methods=["POST"])
def incoming():
    data = request.get_json()
    stk_callback = data.get("Body", {}).get("stkCallback", {})
    checkout_request_id = stk_callback.get("CheckoutRequestID")
    result_code = stk_callback.get("ResultCode")

    if result_code == 0:
        payment_status[checkout_request_id] = {"status": "success"}
    else:
        payment_status[checkout_request_id] = {"status": "failed"}

    return jsonify({"status": "success"}), 200

@app.route("/payment/status/<checkout_request_id>", methods=["GET"])
def check_payment_status(checkout_request_id):
    status = payment_status.get(checkout_request_id, {"status": "unknown"})
    return jsonify(status)

@app.route('/validation', methods = ["POST"])
def validating ():
    data = request.get_json()
    print(data)
    return "ok"


def fuzzy_match(search_query, column_values, threshold=70):
    """
    Find the closest match for the search query in the given column values.
    """
    matches = process.extract(search_query, column_values, limit=5, scorer=fuzz.partial_ratio)
    return [match[0] for match in matches if match[1] >= threshold]  # Only return matches above threshold


@app.route("/", methods=["GET"])
def home():
    print("The server is running.")
    return("The server is running.")

@app.route("/recommend", methods=["GET"])
def recommend():
    search_query = request.args.get("query", "").strip().lower()
    brand = request.args.get("brand", "").strip().lower()
    price = request.args.get("price", type=float)

    recommendations = pd.DataFrame()

    # 🔹 1️⃣ Word2Vec-based Recommendation
    if search_query:
        search_words = search_query.split()  # Tokenize search query
        valid_words = [word for word in search_words if word in word2vec_model.wv]

        if valid_words:
            df["similarity"] = df["tokenized_desc"].apply(
                lambda desc: word2vec_model.wv.n_similarity(desc, valid_words) if len(desc) > 0 else 0
            )
            recommendations = df.nlargest(5, "similarity")[["id", "name", "brand", "price", "image_url"]]
        else:
            # 🔹 2️⃣ Fuzzy Matching as Fallback
            matched_descriptions = fuzzy_match(search_query, df["description"])
            if matched_descriptions:
                recommendations = df[df["description"].isin(matched_descriptions)].head(5)[["id", "name", "brand", "price", "image_url"]]
            else:
                # 🔹 3️⃣ Final Fallback: Return First 5 Products
                recommendations = df.head(5)[["id", "name", "brand", "price", "image_url"]]

    # 🔹 Brand-based Recommendation
    elif brand:
        recommendations = df[df["brand"].str.contains(brand, case=False, na=False)].head(5)[["id", "name", "brand", "price", "image_url"]]

    # 🔹 Price-based Recommendation
    elif price:
        recommendations = df[(df["price"] >= price * 0.9) & (df["price"] <= price * 1.1)].head(5)[["id", "name", "brand", "price", "image_url"]]

    # Ensure Original ID is Preserved
    if not recommendations.empty:
        recommendations = recommendations.set_index("id").reset_index()

    return jsonify(recommendations.to_dict(orient="records"))

@app.route("/first-five", methods=["GET"])
def get_first_five_products():
    """
    Returns the first 5 products in the dataset.
    """
    first_five = df.head(5)[["id", "name", "brand", "price", "image_url"]]
    return jsonify(first_five.to_dict(orient="records"))

@app.route("/all-products", methods=["GET"])
def get_all_products():
    """
    Returns all products from the dataset.
    """
    all_products = df[["id", "name", "brand", "price", "image_url"]].to_dict(orient="records")
    return jsonify(all_products)

@app.route("/product/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    """
    Returns details of a specific product by its ID, including the description.
    """
    product = df[df["id"] == product_id]

    if not product.empty:
        return jsonify(product.iloc[0][["id", "name", "brand", "price", "image_url", "description"]].to_dict())
    else:
        return jsonify({"error": "Product not found"}), 404


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
