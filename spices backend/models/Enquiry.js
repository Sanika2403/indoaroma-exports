const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    product: String,
    quantity: Number,
    country: String
});

module.exports = mongoose.model("Enquiry", enquirySchema);