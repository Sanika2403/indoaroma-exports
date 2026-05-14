const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    username: String,
    product: String,
    price: Number,
    quantity: Number
});

module.exports = mongoose.model("Cart", cartSchema);