# Import necessary libraries
from flask import Flask, request, jsonify
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import razorpay
import qrcode
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import os
import uuid
from dotenv import load_dotenv
import io
import base64
from bson import ObjectId

# Load environment variables
load_dotenv()

app = Flask(__name__)

# MongoDB Atlas Configuration
mongo_uri = os.getenv("mongodb+srv://infest2k25userdata:308MXoSbS0z6LPcq@infest2k25userregistrat.6iobv.mongodb.net/?retryWrites=true&w=majority&appName=INFEST2K25UserRegistration", "mongodb+srv://infest2k25userdata:308MXoSbS0z6LPcq@cluster0.mongodb.net/")
client = MongoClient(mongo_uri, server_api=ServerApi('1'))
db = client.event_registration_db
registrations = db.registrations

# Razorpay Configuration
razorpay_key_id = os.getenv("RAZORPAY_KEY_ID", "your_razorpay_key_id")
razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET", "your_razorpay_key_secret")
razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

# Email Configuration
email_sender = os.getenv("infest2k25", "infest2k25@gmail.com")
email_password = os.getenv("INFO@2732", "rmac uddi oxbj qaxa")
smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
smtp_port = int(os.getenv("SMTP_PORT", "587"))

# Event Configuration
event_fee = int(os.getenv("250", "500"))  # Amount in rupees

# Department options
departments = {
    "CSE, IT,AI & DS": ["Paper Presentation", "Project Presentation", "Google Hunt", "Crash Your Codes", "Web Master", "Gaming"],
    "ECE & EEE": ["Paper Presentation", "Project Presentation", "Tech Connection", "Circuit Debugging", "Technical Quiz", "Treasure Hunt"],
    "MECH": ["Paper Presentation", "Project Presentation", "CAD Master", "Fun Series", "Water Rocketry", "Mr. Mechanic"],
    "S & H": ["Paper Presentation", "Fun Quiz", "Technical Debate", "Pencil Sketch & Painting", "Math Puzzles", "Karaoke Singing", "Dance or Mime"],
    "MBA": ["Paper Presentation", "Best Manager", "Business Quiz", "ADZAP", "Corporate Walk", "Corporate Stall", "Treasure Hunt"],
}

# Helper function to generate QR code
def generate_qr_code(registration_id):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(registration_id)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    return img_byte_arr.getvalue()

# Helper function to send confirmation email
def send_confirmation_email(recipient_email, registration_data, qr_code_image, payment_status):
    msg = MIMEMultipart()
    msg['From'] = email_sender
    msg['To'] = recipient_email
    
    if payment_status == "PAID":
        msg['Subject'] = "Event Registration Confirmation - Payment Received"
        body = f"""
        <html>
        <body>
            <h2>Registration Confirmation</h2>
            <p>Thank you for registering for our event!</p>
            <p>Your registration details:</p>
            <ul>
                <li>Name: {registration_data['name']}</li>
                <li>Email: {registration_data['email']}</li>
                <li>Phone: {registration_data['phone']}</li>
                <li>College: {registration_data['college']}</li>
                <li>Department: {registration_data['department']}</li>
                <li>Payment Status: Completed</li>
            </ul>
            <p>Please present the QR code attached to this email at the venue.</p>
        </body>
        </html>
        """
    else:
        msg['Subject'] = "Event Registration Confirmation - Payment Pending"
        body = f"""
        <html>
        <body>
            <h2>Registration Confirmation</h2>
            <p>Thank you for registering for our event!</p>
            <p>Your registration details:</p>
            <ul>
                <li>Name: {registration_data['name']}</li>
                <li>Email: {registration_data['email']}</li>
                <li>Phone: {registration_data['phone']}</li>
                <li>College: {registration_data['college']}</li>
                <li>Department: {registration_data['department']}</li>
                <li>Payment Status: Pending</li>
            </ul>
            <p>Please complete your payment at the venue. The registration fee is {event_fee} rupees.</p>
            <p>Please present the QR code attached to this email at the venue.</p>
        </body>
        </html>
        """
    
    msg.attach(MIMEText(body, 'html'))
    
    # Attach QR code image
    qr_img = MIMEImage(qr_code_image)
    qr_img.add_header('Content-Disposition', 'attachment', filename='registration_qr.png')
    msg.attach(qr_img)
    
    # Send email
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(email_sender, email_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# API route for getting department options
@app.route('/api/departments', methods=['GET'])
def get_departments():
    return jsonify(list(departments.keys()))

# API route for getting options for a specific department
@app.route('/api/departments/<department>/options', methods=['GET'])
def get_department_options(department):
    if department in departments:
        return jsonify(departments[department])
    return jsonify({"error": "Department not found"}), 404

# API route for user registration
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'whatsapp', 'college', 'year', 'department', 'department_option', 'project_link', 'payment_mode']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Generate unique registration ID
        registration_id = str(uuid.uuid4())
        
        # Create registration object
        registration = {
            "_id": registration_id,
            "name": data['name'],
            "email": data['email'],
            "phone": data['phone'],
            "whatsapp": data['whatsapp'],
            "college": data['college'],
            "year": data['year'],
            "department": data['department'],
            "department_option": data['department_option'],
            "project_link": data['project_link'],
            "payment_mode": data['payment_mode'],
            "payment_status": "PENDING",
            "registration_date": pymongo.datetime.datetime.utcnow()
        }
        
        # Save registration to MongoDB
        registrations.insert_one(registration)
        
        # Generate QR code
        qr_code = generate_qr_code(registration_id)
        qr_code_base64 = base64.b64encode(qr_code).decode('utf-8')
        
        response_data = {"registration_id": registration_id, "qr_code": qr_code_base64}
        
        # Handle payment based on mode
        if data['payment_mode'] == 'ONLINE':
            # Create Razorpay order
            order_data = {
                'amount': event_fee * 100,  # Amount in paise
                'currency': 'INR',
                'receipt': f'receipt_{registration_id}',
                'notes': {
                    'registration_id': registration_id
                }
            }
            order = razorpay_client.order.create(data=order_data)
            response_data['order'] = order
        else:  # OFFLINE payment
            # Send confirmation email with QR code for offline payment
            send_confirmation_email(data['email'], registration, qr_code, "PENDING")
        
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API route to verify Razorpay payment
@app.route('/api/verify-payment', methods=['POST'])
def verify_payment():
    try:
        data = request.json
        
        # Verify the payment signature
        params_dict = {
            'razorpay_order_id': data['razorpay_order_id'],
            'razorpay_payment_id': data['razorpay_payment_id'],
            'razorpay_signature': data['razorpay_signature']
        }
        
        # Verify signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Update payment status in MongoDB
        registration_id = data['registration_id']
        registrations.update_one(
            {"_id": registration_id},
            {"$set": {"payment_status": "PAID", "razorpay_payment_id": data['razorpay_payment_id']}}
        )
        
        # Get registration data
        registration_data = registrations.find_one({"_id": registration_id})
        
        # Generate QR code
        qr_code = generate_qr_code(registration_id)
        
        # Send confirmation email with QR code
        send_confirmation_email(registration_data['email'], registration_data, qr_code, "PAID")
        
        return jsonify({"success": True, "message": "Payment verified successfully"})
    
    except Exception as e:
        return jsonify({"error": str(e), "message": "Payment verification failed"}), 400

# API route to check registration status
@app.route('/api/registration/<registration_id>', methods=['GET'])
def get_registration(registration_id):
    try:
        registration = registrations.find_one({"_id": registration_id})
        if registration:
            # Convert ObjectId to string for JSON serialization
            registration['_id'] = str(registration['_id'])
            # Format date for readability
            registration['registration_date'] = registration['registration_date'].isoformat()
            return jsonify(registration)
        else:
            return jsonify({"error": "Registration not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Admin API route to get all registrations (with authentication)
@app.route('/api/admin/registrations', methods=['GET'])
def get_all_registrations():
    # Simple authentication (should be improved in production)
    auth_token = request.headers.get('Authorization')
    if auth_token != os.getenv("ADMIN_API_KEY"):
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        all_registrations = list(registrations.find())
        # Convert ObjectId to string for JSON serialization
        for reg in all_registrations:
            reg['_id'] = str(reg['_id'])
            reg['registration_date'] = reg['registration_date'].isoformat()
        
        return jsonify(all_registrations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Admin API route to update payment status (for offline payments)
@app.route('/api/admin/update-payment', methods=['POST'])
def update_payment_status():
    # Simple authentication (should be improved in production)
    auth_token = request.headers.get('Authorization')
    if auth_token != os.getenv("ADMIN_API_KEY"):
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        data = request.json
        registration_id = data['registration_id']
        
        # Update payment status
        registrations.update_one(
            {"_id": registration_id},
            {"$set": {"payment_status": "PAID", "payment_updated_by": "admin"}}
        )
        
        # Get registration data
        registration_data = registrations.find_one({"_id": registration_id})
        
        # Generate QR code
        qr_code = generate_qr_code(registration_id)
        
        # Send confirmation email with updated status
        send_confirmation_email(registration_data['email'], registration_data, qr_code, "PAID")
        
        return jsonify({"success": True, "message": "Payment status updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)