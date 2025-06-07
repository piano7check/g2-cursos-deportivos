from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.autenticacion import autenticacion
from routes.routesAdmin import routes_admin
from routes.routesProfesor import routes_profesor
from routes.routesStudent import routes_student
from routes.routesUsuarios import routes_usuarios
from routes.routesCategorias import routes_categorias

load_dotenv()

app = Flask(__name__)

# Configuración CORS mejorada
# Permitir solicitudes desde el frontend de Vite, incluyendo preflight OPTION
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"]}}, supports_credentials=True)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu_clave_secreta_aqui') # Usa una clave segura y desde .env

app.register_blueprint(autenticacion, url_prefix='/api/auth')
app.register_blueprint(routes_admin, url_prefix='/api/admin')
app.register_blueprint(routes_profesor, url_prefix='/api/profesor')
app.register_blueprint(routes_student, url_prefix='/api/estudiante')
app.register_blueprint(routes_usuarios, url_prefix='/api/user')
app.register_blueprint(routes_categorias, url_prefix='/api')

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Sports Courses API"})

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Recurso no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    # Aquí puedes añadir logging para ver la causa real del 500
    return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv('PORT', 5000))

