from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sql_server.upload
import sql_server.mdbAuth

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

@app.route('/scenejson_request', methods=['POST'])
def scenejson_request():
     try:
          data = request.json
          data = str(data)
          #change file_path so that it accepts json files instead. I don't
          #want to create an intermediary file, so esentially push it as an object
          #im wondering if there can be an internal function in the server that always runs
          #and makes it so that the json object is only converted in the server and nowhere else
          #bash file script to manage this process on the server? Add author_id to front-end
          sql_server.send_file("107.21.218.63", 57832, data, 1)
          return jsonify({"message": "Data received successfully", "data": data}), 200
     except Exception as e:
          print("Error:", str(e))
          return jsonify({"error": "Invalid request"}), 400

@app.route('/login', methods=['POST'])
def login():
     data = request.json
     username = data.get("username")
     password = data.get("password")

     db = sql_server.mdbAuth.MariaDBAuth()

     #Try the username password combo,
     if db.authenticate_user(username, password):
          db.close()
          return jsonify({"message": "Login successfully"}), 200
     else:
          db.close()
          return jsonify({"error": "Invalid credentials"}), 401

@app.route('/register', methods=['POST'])
def register():
     data = request.json
     username = data.get("username")
     password = data.get("password")
     password_confirm = data.get("password_confirm")

     db = sql_server.mdbAuth.MariaDBAuth()
     username = username.lower()
     print(username)
     if password == password_confirm:
          if db.verify_unique_username(username):
               db.add_user(username, password)
               db.close()
               return jsonify({"message": "User successfully created"}), 200

          else:
               db.close()
               return jsonify({"message": "Error, Username exists"}), 400
     else:
          db.close()
          return jsonify({"message": "Password confirmation failed, Password and username don't match"}), 400
@app.route('/')
def hello_world():
     return send_from_directory("../static/react-flask-app/build", "index.html")

if __name__ == '__main__':
     app.run()
