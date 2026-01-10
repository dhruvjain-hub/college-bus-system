from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'transport-secret'
jwt = JWTManager(app)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    token = create_access_token(identity=data["email"])
    return jsonify(token=token)

if __name__ == "__main__":
    app.run(debug=True)
