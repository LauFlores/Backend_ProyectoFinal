const socket = require("socket.io");
const { logger } = require("../utils/logger.js"); // Importa el logger
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository(logger); 
const MessageModel = require("../models/message.model.js");

class SocketManager {
    constructor(server) {
        this.io = socket(server);
        this.initSocketEvents();
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Nuevo cliente conectado");

            // Se envía el array de productos al cliente
            socket.emit("products", await productRepository.getProducts());

            // Evento para eliminar producto del lado cliente
            socket.on("deleteProduct", async (id) => {
                await productRepository.deleteProduct(id);
                // Se envía nuevamente la vista actualizada a todos los clientes
                this.emitUpdatedProducts(socket);
            });

            // Evento para agregar producto
            socket.on("addProduct", async (product) => {
                await productRepository.addProduct(product);
                // Se envía nuevamente la vista actualizada a todos los clientes
                this.emitUpdatedProducts(socket);
            });

            socket.on("message", async (data) => {
                await MessageModel.create(data);
                const messages = await MessageModel.find();
                socket.emit("message", messages);
            });
        });
    }

    async emitUpdatedProducts(socket) {
        const updatedProducts = await productRepository.getProducts();
        console.log("Productos actualizados:", updatedProducts); // Agregar este console.log
        socket.emit("products", updatedProducts);
    }
    
}

module.exports = SocketManager;
