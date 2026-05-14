const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    username: String,
    items: Array,
    total: Number,
    paymentMethod: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);