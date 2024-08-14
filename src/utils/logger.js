const winston = require("winston");
const configObject = require("../config/config.js");

const {node_env} = configObject;

//Ejemplo configurando nuestros propios niveles: 

const levels = {
    level: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: "red",
        error: "yellow",
        warning: "blue",
        info: "green",
        http: "magenta",
        debug: "white"
    }
}

// Configuración del logger para desarrollo
const loggerDesarrollo = winston.createLogger({
    levels: levels.level,
    transports: [
        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(
                winston.format.colorize({colors: levels.colors}),
                winston.format.simple()
            )
        }),
    ]
});

// Configuración del logger para producción
const loggerProduccion = winston.createLogger({
    levels: levels.level,
    transports: [
        new winston.transports.File({
            filename: "./errors.log",
            level: "info", 
            format: winston.format.simple()
        })
    ]
});

//Determinar que logger utilizar segun el entorno: 

const logger = node_env === "produccion" ? loggerProduccion : loggerDesarrollo;


//Creamos un middleware: 

const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);
    next();
}

module.exports = { addLogger, logger };