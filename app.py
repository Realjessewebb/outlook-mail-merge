import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, render_template, jsonify
from routes.parse import parse_bp
from routes.preview import preview_bp
from routes.send import send_bp
from lib.config import FROM_EMAIL

app = Flask(__name__)
app.register_blueprint(parse_bp)
app.register_blueprint(preview_bp)
app.register_blueprint(send_bp)

@app.route("/")
def index():
    return render_template("ui.html")

@app.route("/from_email")
def from_email():
    return jsonify({"email": FROM_EMAIL})

if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)
