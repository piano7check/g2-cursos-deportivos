from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.autenticacion import autenticacion
from routes.routesAdmin import routes_admin
from routes.routesProfesor import routes_profesor
from routes.routesStudent import routes_student
from routes.routesUsuarios import routes_usuarios
from routes.routesCategorias import routes_categorias
from routes.routesReservas import reservas_bp

load_dotenv()

app = Flask(__name__)


UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}

CORS(app, resources={
    r"/api/*": {
        "origins": "http://localhost:5173",
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/uploads/*": {
        "origins": "http://localhost:5173",
        "methods": ["GET", "OPTIONS"]
    }
})
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu_clave_secreta_aqui')

app.register_blueprint(autenticacion, url_prefix='/api/auth')
app.register_blueprint(routes_admin, url_prefix='/api/admin')
app.register_blueprint(routes_profesor, url_prefix='/api/profesor')
app.register_blueprint(routes_student, url_prefix='/api/estudiante')
app.register_blueprint(routes_usuarios, url_prefix='/api/user')
app.register_blueprint(routes_categorias, url_prefix='/api')
app.register_blueprint(reservas_bp, url_prefix='/api')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Sports Courses API"})

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Recurso no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv('PORT', 5000))
