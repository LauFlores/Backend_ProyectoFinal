const noRequiredFieldsInfo = ({ title, description, price, thumbnail, code, stock, category }) => {
    return `Falta de datos requeridos.
    Cada nuevo producto debe contar con:
    - Título: ${title ? `Se recibió ${title}` : 'No se recibió un título válido'}
    - Descripción: ${description ? `Se recibió ${description}` : 'No se recibió una descripción válida'}
    - Precio: ${price ? `Se recibió ${price}` : 'No se recibió un precio válido'}
    - Thumbnail: ${thumbnail ? `Se recibió ${thumbnail}` : 'Sin imagen'}
    - Código: ${code ? `Se recibió ${code}` : 'No se recibió un código válido'}
    - Stock: ${stock ? `Se recibió ${stock}` : 'No se recibió un stock válido'}
    - Categoría: ${category ? `Se recibió ${category}` : 'No se recibió una categoría válida'}`
};

module.exports = {
    noRequiredFieldsInfo
};
