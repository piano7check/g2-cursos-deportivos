import jwt
import datetime
import os 
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

def generarToken(usuario):
    payload={
        "id" : usuario['id'],
        "name": usuario['name'],
        "lastname": usuario['lastname'],
        "email": usuario['email'],
        "rol": usuario["rol"],
        "exp": datetime.datetime.now(datetime.timezone.utc)+ datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token
    