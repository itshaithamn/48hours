from flask import Flask, send_from_directory

app = Flask(__name__, static_folder="../static/react-flask-app/build", static_url_path="/")

@app.route('/')
def hello_world():  # put application's code here
    return send_from_directory(app.static_folder, "Home.js")

if __name__ == '__main__':
    app.run()


# from flask import Flask, request, jsonify
#
# app = Flask(__name__)
#
# @app.route('/receive_data', methods=['POST'])
# def receive_data():
#     data = request.json  # Get JSON data from request
#     print("Received Data:", data)
#     return jsonify({"message": "Data received", "data": data})
#
# if __name__ == '__main__':
#     app.run(debug=True)
