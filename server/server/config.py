from flask import Flask
from flask_cors import CORS
import logging

logger = logging.getLogger('werkzeug')
logger.setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app)
