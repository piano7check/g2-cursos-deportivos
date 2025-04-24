from flask import Flask
from routes.autenticacion import autentificacionesUsuario  
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

app.register_blueprint(autentificacionesUsuario)

if __name__ == "__main__":
    app.run(debug=True)
