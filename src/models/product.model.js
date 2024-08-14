const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    img: {
        type: String,
    },
    thumbnail: {
        type: [String]
    },
    owner: {
        type: String, 
        required: true, 
        default: 'admin'
        }     
});

const ProductModel = mongoose.model("products", productSchema);

module.exports = ProductModel;
