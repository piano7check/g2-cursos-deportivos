from data.conexion import obtenerConexion
import pymysql.cursors

class CategoriasModel:
    @staticmethod
    def crear_categoria(nombre):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor() as cursor:
                sql = "INSERT INTO categorias(nombre) VALUES (%s)"
                cursor.execute(sql, (nombre,))
                conexion.commit()
                return {"id": cursor.lastrowid, "nombre": nombre, "mensaje": "Categoría creada exitosamente"}
        except pymysql.Error as e:
            conexion.rollback()
            if e.args[0] == 1062:
                return {"error": "Categoría ya existe", "codigo": 409}
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            conexion.rollback()
            return {"error": str(e), "codigo": 500}
        finally:
            conexion.close()

    @staticmethod
    def obtener_todas_categorias():
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = "SELECT id, nombre FROM categorias"
                cursor.execute(sql)
                categorias = cursor.fetchall()
                return categorias
        except pymysql.Error as e:
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": str(e), "codigo": 500}
        finally:
            conexion.close()

    @staticmethod
    def obtener_categoria_por_id(id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = "SELECT id, nombre FROM categorias WHERE id = %s"
                cursor.execute(sql, (id,))
                categoria = cursor.fetchone()
                return categoria
        except pymysql.Error as e:
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": str(e), "codigo": 500}
        finally:
            conexion.close()

    @staticmethod
    def actualizar_categoria(id, nombre):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor() as cursor:
                sql = "UPDATE categorias SET nombre = %s WHERE id = %s"
                cursor.execute(sql, (nombre, id))
                conexion.commit()
                if cursor.rowcount == 0:
                    return {"error": "Categoría no encontrada o no se realizaron cambios", "codigo": 404}
                return {"id": id, "nombre": nombre, "mensaje": "Categoría actualizada exitosamente"}
        except pymysql.Error as e:
            conexion.rollback()
            if e.args[0] == 1062: 
                return {"error": "El nombre de la categoría ya existe", "codigo": 409}
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            conexion.rollback()
            return {"error": str(e), "codigo": 500}
        finally:
            conexion.close()

    @staticmethod
    def eliminar_categoria(id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor() as cursor:
                sql = "DELETE FROM categorias WHERE id = %s"
                cursor.execute(sql, (id,))
                conexion.commit()
                if cursor.rowcount == 0:
                    return {"error": "Categoría no encontrada", "codigo": 404}
                return {"mensaje": "Categoría eliminada exitosamente"}
        except pymysql.Error as e:
            conexion.rollback()
            if e.args[0] == 1451:
                return {"error": "No se puede eliminar la categoría porque hay cursos asociados.", "codigo": 409}
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            conexion.rollback()
            return {"error": str(e), "codigo": 500}
        finally:
            conexion.close()

