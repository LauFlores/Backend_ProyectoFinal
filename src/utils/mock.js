const { faker } = require("@faker-js/faker");

const generateMockProducts = () => {
    return {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.database.mongodbObjectId(), // Generar un código simulando un ObjectId de MongoDB
        price: parseFloat(faker.commerce.price()), // Convertir el precio a un número flotante
        status: faker.datatype.boolean(), // Generar un estado aleatorio (true/false)
        stock: parseInt(faker.string.numeric()), // Generar un número aleatorio para el stock
        category: faker.commerce.department(), // Generar una categoría aleatoria
        thumbnail: faker.image.avatar() // Generar una URL de imagen aleatoria y almacenarla en un array
    };
};

module.exports = generateMockProducts;
