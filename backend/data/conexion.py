import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("DB_HOST")
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
DATABASE = os.getenv("DB_NAME")

def obtenerConexion():
    try:
        print("Intentando conectar con la base de datos...")  # Ver si entra al try
        conexion = pymysql.connect(
            host=HOST,
            user=USER,
            password=PASSWORD,
            database=DATABASE
        )
        print("Conexión exitosa")
        conexion.autocommit = False
        return conexion
    except pymysql.MySQLError as error:
        print(f"Error en la conexión: {error}")
        return None  
    except Exception as ex:
        print(f"Error inesperado: {ex}")
        return None

if __name__ == "__main__":
    obtenerConexion()
