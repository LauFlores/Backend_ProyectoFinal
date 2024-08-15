const { v4: uuidv4 } = require('uuid');

function generarNuevoIdDeCarrito() {
    return uuidv4(); //  lógica  para generar el ID
}

module.exports = generarNuevoIdDeCarrito;