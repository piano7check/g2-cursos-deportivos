Para correr el proyecto realizar los siguientes pasos:

Clonar el repo

**Requerimientos**
    -Python 3.x (para adelante)
    -pip (para manejar paquetes de python)
    -Nodejs 18.x hasta la 20.x (no recomendada 21.x aun en produccion y tiende a tener fallos)

**ENV**

    -Crear un archivo ".env" en la raiz del proyecto, donde la estructura se debe de ver asi
            DB_HOST= x
            DB_USER= x
            DB_PASSWORD= x
            DB_NAME= x

            SECRET_KEY= x

**BACKEND**

    cd backend
    python -m venv venv
    venv\Scripts\activate  
    pip install -r requirements.txt

**FRONTEND**
    
    cd frontend
    npm install

--LUEGO DE INSTALAR TODO CORREMOS LA APLICACION

**cd backend**

    python app.py

**cd frontend**

    npm start
