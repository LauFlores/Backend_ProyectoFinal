const express = require('express');
const router = express.Router();

// Importa el middleware de registro
const { addLogger } = require("../utils/logger.js");

// Define las rutas para /loggerTest
router.get("/", addLogger, (req, res) => {
    // Genera algunos registros de ejemplo
    req.logger.debug('Este es un mensaje de debug');
    req.logger.http('Este es un mensaje HTTP');
    req.logger.info('Este es un mensaje de información');
    req.logger.warning('Este es un mensaje de advertencia');
    req.logger.error('Este es un mensaje de error');
    req.logger.fatal('Este es un mensaje fatal');

    res.send('Registros de prueba generados');
});

module.exports = router;
