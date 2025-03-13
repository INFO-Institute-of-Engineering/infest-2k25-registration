from flask import Flask, request, jsonify
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
import os

app = Flask(__name__)

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['your_database_name']  # Change to your database name
collection = db['your_collection_name']  # Change to your collection name

@app.route('/api/register', methods=['POST'])
def register():
    try:
        # Check MongoDB connection
        client.admin.command('ping')
    except ConnectionFailure:
        return jsonify({"error": "Failed to connect to MongoDB Atlas."}), 500

    data = request.json

    # Required fields
    required_fields = ['name', 'email', 'phone', 'whatsapp', 'college', 
                       'year', 'department', 'department_option', 'project_link']

    # Check for missing fields
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    # Insert data into MongoDB
    try:
        collection.insert_one(data)
        return jsonify({"success": "Data registered successfully!"}), 201
    except DuplicateKeyError:
        return jsonify({"error": "Duplicate entry detected."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
