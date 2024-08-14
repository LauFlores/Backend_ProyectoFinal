//Creamos una clase para generar nuestros propios errores:

class CustomError {
    static createError({name = "Error", cause = "Desconocido", message, code = 1}){
        const error = new Error(message);
        error.name = name;
        error.cause = cause;
        error.code = code;
        throw error;
        //Lanzamos el error, esto detiene la ejecución de la app, por eso debemos caprturarlo en el otro modulo
    }
}


module.exports = CustomError;
