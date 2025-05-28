from flask import Flask
from routes.autenticacion import autentificacionesUsuario 
from routes.routesAdmin import routesAdmin
from routes.routesStudent import cursosEstudiante
from routes.routesUsuarios import routesUsuarios
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

app.register_blueprint(autentificacionesUsuario)
app.register_blueprint(routesAdmin, url_prefix='/admin')
app.register_blueprint(cursosEstudiante)
app.register_blueprint(routesUsuarios)

if __name__ == "__main__":
    app.run(debug=True)
