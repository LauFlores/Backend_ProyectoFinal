const mongoose = require("mongoose");
const configObject = require("./config/config.js");
const {mongo_url} = configObject;

mongoose.connect(mongo_url)
    .then(() => console.log("Conexion exitosa"))
    .catch(() => console.log("Error en la conexion"))
