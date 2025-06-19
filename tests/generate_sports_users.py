import bcrypt
from datetime import datetime, timedelta
import random
"""
Ejecturar el comando en la terminal 

python generate_sports_users.py > sports_users.sql 

"""

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_sports_users(num_admins=2, num_coaches=5, num_athletes=30):
    first_names = ["Carlos", "Ana", "Luis", "María", "Javier", "Sofía", "Diego", "Valeria", "Andrés", "Camila"]
    last_names = ["Gómez", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "García", "Sánchez", "Romero", "Díaz"]
    sports_domains = ["clubdeportivo.com", "deportesmail.com", "atletismo.org", "sportsacademy.edu"]

    users = []
    
    for i in range(num_admins):
        users.append({
            "name": random.choice(first_names),
            "lastname": random.choice(last_names),
            "birthdate": (datetime.now() - timedelta(days=365*35)).strftime("%Y-%m-%d"),
            "email": f"admin{i+1}@{random.choice(sports_domains)}",
            "password": "Admin123",
            "rol": "admin"
        })
    
    for i in range(num_coaches):
        users.append({
            "name": random.choice(first_names),
            "lastname": random.choice(last_names),
            "birthdate": (datetime.now() - timedelta(days=365*(25 + random.randint(3, 15)))).strftime("%Y-%m-%d"),
            "email": f"entrenador.{i+1}@{random.choice(sports_domains)}",
            "password": "Profesor123",
            "rol": "profesor"
        })
    
    for i in range(num_athletes):
        users.append({
            "name": random.choice(first_names),
            "lastname": random.choice(last_names),
            "birthdate": (datetime.now() - timedelta(days=365*(12 + random.randint(5, 20)))).strftime("%Y-%m-%d"),
            "email": f"atleta.{i+1}@{random.choice(sports_domains)}",
            "password": "Estudiante123",
            "rol": "estudiante"
        })

    inserts = ["-- Usuarios del club deportivo (contraseñas hasheadas con bcrypt)"]
    for user in users:
        hashed_pw = hash_password(user["password"])
        inserts.append(
            f"INSERT INTO `users` (`name`, `lastname`, `birthdate`, `email`, `password`, `rol`) "
            f"VALUES ('{user['name']}', '{user['lastname']}', '{user['birthdate']}', "
            f"'{user['email']}', '{hashed_pw}', '{user['rol']}');"
        )
    
    return "\n".join(inserts)

if __name__ == "__main__":
    print("-- Generador de usuarios para sistema deportivo")
    print(generate_sports_users())
    
    