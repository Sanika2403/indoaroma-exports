const Razorpay = require("razorpay");
const express = require("express");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Contact = require("./models/Contact");
const Enquiry = require("./models/Enquiry");

const app = express();
const razorpay = new Razorpay({
    key_id: "rzp_test_SdVUDXS0nRXGKT",
    key_secret: "9UG87X2GPZiDu0l5GYByTY03"
});

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/spicesDB")
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err));

/* ================= AUTH ================= */

app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return res.json({ message: "Username already exists ❌" });
    }

    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ message: "Signup successful ✅" });
    } catch {
        res.json({ message: "Error saving user ❌" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (username === "admin" && password === "1234") {
            return res.json({ message: "Login successful ✅", role: "admin" });
        }

        const user = await User.findOne({ username, password });

        if (user) {
            res.json({ message: "Login successful ✅", role: "user" });
        } else {
            res.json({ message: "Invalid credentials ❌" });
        }

    } catch {
        res.json({ message: "Error during login ❌" });
    }
});

/* ================= CART ================= */

app.post("/add-to-cart", async (req, res) => {
    const { username, product, price } = req.body;

    try {
        let item = await Cart.findOne({ username, product });

        if (item) {
            item.quantity += 1;
        } else {
            item = new Cart({ username, product, price, quantity: 1 });
        }

        await item.save();
        res.json({ message: "Item added 🛒" });

    } catch {
        res.json({ message: "Error ❌" });
    }
});

app.get("/cart/:username", async (req, res) => {
    const items = await Cart.find({ username: req.params.username });
    res.json(items);
});

app.post("/update-cart", async (req, res) => {
    const { username, product, action } = req.body;

    let item = await Cart.findOne({ username, product });

    if (!item) return res.json({ message: "Not found ❌" });

    if (action === "increase") item.quantity++;
    else if (action === "decrease") {
        item.quantity--;
        if (item.quantity <= 0) {
            await Cart.deleteOne({ username, product });
            return res.json({ message: "Removed 🗑" });
        }
    }

    await item.save();
    res.json({ message: "Updated 🔄" });
});

/* ================= ORDER ================= */

app.post("/place-order", async (req, res) => {
    const { username, paymentMethod } = req.body;

    const cartItems = await Cart.find({ username });

    if (cartItems.length === 0)
        return res.json({ message: "Cart empty ❌" });

    let total = 0;
    cartItems.forEach(i => total += i.price * i.quantity);

    const order = new Order({
        username,
        items: cartItems,
        total,
        paymentMethod
    });

    await order.save();
    await Cart.deleteMany({ username });

    res.json({ message: "Order placed 🎉" });
});

app.post("/create-order", async (req, res) => {

    const { amount } = req.body;

    const options = {
        amount: amount * 100, // paise
        currency: "INR",
        receipt: "order_rcptid_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
});

/* ================= USERS & ORDERS ================= */

app.get("/users", async (req, res) => {
    res.json(await User.find());
});

app.get("/orders", async (req, res) => {
    res.json(await Order.find());
});

/* ================= ENQUIRY ================= */

// ✅ FIXED (ADDED)
app.post("/api/enquiries", async (req, res) => {
    try {
        const enquiry = new Enquiry(req.body);
        await enquiry.save();
        res.json({ message: "Enquiry saved ✅" });
    } catch {
        res.json({ message: "Error ❌" });
    }
});

app.get("/api/enquiries", async (req, res) => {
    res.json(await Enquiry.find());
});

app.delete("/enquiry/:id", async (req, res) => {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted 🗑" });
});

/* ================= CONTACT ================= */

app.post("/contacts", async (req, res) => {
    const contact = new Contact(req.body);
    await contact.save();
    res.json({ message: "Saved ✅" });
});

app.get("/contacts", async (req, res) => {
    res.json(await Contact.find());
});

app.get("/receipt/:username", async (req, res) => {

    const username = req.params.username;

    const orders = await Order.find({ username });

    if (orders.length === 0) {
        return res.send("No orders found");
    }

    const latestOrder = orders[orders.length - 1];

    const doc = new PDFDocument({
        margin: 50
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=invoice.pdf"
    );

    doc.pipe(res);

    // ================= HEADER =================

    doc
        .fillColor("#8B0000")
        .fontSize(28)
        .text("IndoAroma Exports", {
            align: "center"
        });

    doc.moveDown(0.5);

    doc
        .fillColor("black")
        .fontSize(18)
        .text("Payment Invoice", {
            align: "center"
        });

    doc.moveDown(2);

    // ================= CUSTOMER DETAILS =================

    doc
        .fontSize(14)
        .text(`Customer Name: ${username}`);

    doc.moveDown(0.5);

    doc.text(
        `Invoice Date: ${new Date().toLocaleString()}`
    );

    doc.moveDown(0.5);

    doc
        .fillColor("green")
        .text("Payment Status: Paid ✅");

    doc.moveDown(1.5);

    // ================= ORDER SUMMARY =================

    doc
        .fillColor("#8B0000")
        .fontSize(18)
        .text("Order Summary");

    doc.moveDown(1);

    // ================= TABLE HEADER =================

    doc
        .fillColor("black")
        .fontSize(14);

    doc.text("Product", 50, doc.y, {
        continued: true
    });

    doc.text("Qty", 250, doc.y, {
        continued: true
    });

    doc.text("Price", 350, doc.y);

    doc.moveDown(0.5);

    doc.moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

    doc.moveDown(0.5);

    // ================= PRODUCTS =================

    latestOrder.items.forEach(item => {

        doc.text(item.product, 50, doc.y, {
            continued: true
        });

        doc.text(item.quantity.toString(), 250, doc.y, {
            continued: true
        });

        doc.text(`₹${item.price}`, 350, doc.y);

        doc.moveDown(0.5);
    });

    doc.moveDown(1);

    doc.moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

    doc.moveDown(1);

    // ================= TOTAL =================

    doc
        .fontSize(16)
        .fillColor("#8B0000")
        .text(
            `Grand Total: ₹ ${latestOrder.total}`,
            {
                align: "right"
            }
        );

    doc.moveDown(1);

    doc
        .fillColor("black")
        .fontSize(13)
        .text(
            `Payment Method: ${latestOrder.paymentMethod}`
        );

    doc.moveDown(2);

    // ================= FOOTER =================

    doc
        .fontSize(12)
        .fillColor("gray")
        .text(
            "Thank you for choosing IndoAroma Exports 🌿",
            {
                align: "center"
            }
        );

    doc.end();
});

/* ================= SERVER ================= */

app.listen(3000, () => {
    console.log("Server running on port 3000 🚀");
});