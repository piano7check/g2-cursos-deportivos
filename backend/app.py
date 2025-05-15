from flask import Flask
from routes.autenticacion import autentificacionesUsuario 
from routes.admin.routesAdmin import routesAdmin
from routes.routesCursos import cursosEstudiante
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

app.register_blueprint(autentificacionesUsuario)
app.register_blueprint(routesAdmin)
app.register_blueprint(cursosEstudiante)

if __name__ == "__main__":
    app.run(debug=True)
