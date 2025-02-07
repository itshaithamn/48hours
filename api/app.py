from flask import Flask, request, jsonify, send_from_directory

from flask_cors import CORS

app = Flask(__name__, static_folder="../static/react-flask-app/build", static_url_path="/")
CORS(app)



@app.route('/receive_data', methods=['POST'])
def receive_data():
     try:
          data = request.json  # Get JSON data from request
          return jsonify({"message": "Data received successfully", "data": data}), 200
     except Exception as e:
          print("Error:", str(e))
          return jsonify({"error": "Invalid request"}), 400

if __name__ == '__main__':
     app.run(debug=True)
