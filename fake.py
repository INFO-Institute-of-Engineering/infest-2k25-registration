from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables

app = Flask(__name__)

# MongoDB Atlas configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI")  # Example: "mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname"
mongo = PyMongo(app)
db = mongo.db  # Database reference

@app.route("/api/register", methods=["POST"])
def register():
    data = request.form.to_dict()

    required_fields = ["name", "email", "phone", "whatsapp", "college", 
                       "year", "department", "department_option", "project_link"]

    # Check for missing fields
    if not all(field in data for field in required_fields):
        return jsonify({"error": "All fields are required."}), 400

    # Insert data into MongoDB
    db.registrations.insert_one(data)
    return jsonify({"message": "Registration successful!"}), 201

if __name__ == "__main__":
    app.run(debug=True)
