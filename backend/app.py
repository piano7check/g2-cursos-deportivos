from flask import Flask
from routes.autenticacion import autentificacionesUsuario  

app = Flask(__name__)

app.register_blueprint(autentificacionesUsuario)

if __name__ == "__main__":
    app.run(debug=True)
