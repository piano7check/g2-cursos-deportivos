from flask import Flask
from routes.autenticacion import autentificacionesUsuario 
from routes.routesAdmin import routesAdmin
from routes.routesStudent import cursosEstudiante
from routes.routesUsuarios import routesUsuarios
from flask_cors import CORS
app = Flask(__name__)
CORS(app, supports_credentials=True)

app.register_blueprint(autentificacionesUsuario, url_prefix='/autentificacion')
app.register_blueprint(routesAdmin, url_prefix='/admin')
app.register_blueprint(cursosEstudiante, url_prefix='/estudiante')
app.register_blueprint(routesUsuarios)

if __name__ == "__main__":
    app.run(debug=True)
