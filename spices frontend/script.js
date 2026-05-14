let currentFilter = "all";
let cartItems = [];

// 🌿 LOAD PAGE
document.addEventListener("DOMContentLoaded", function () {
    loadNavbar();
    protectPages();
    loadSpices();
    loadCartPage();
    loadOrders();
    loadUsers();
    loadEnquiries();
    loadContacts();
});

// 🌿 SPICES DATA + SEARCH + FILTER
function loadSpices() {

    const spices = [
        { name: "Turmeric", origin: "Andhra Pradesh", price: 200, image: "images/turmeric.jpg", type: "medicinal" },
        { name: "Cinnamon", origin: "Southern India", price: 300, image: "images/cinnamon.jpg", type: "aromatic" },
        { name: "Cardamom", origin: "Kerala", price: 1200, image: "images/cardamom.jpg", type: "aromatic" },
        { name: "Black Pepper", origin: "Karnataka", price: 500, image: "images/pepper.jpg", type: "hot" },
        { name: "Cloves", origin: "Tamil Nadu", price: 900, image: "images/cloves.jpg", type: "aromatic" },
        { name: "Cumin", origin: "Rajasthan", price: 400, image: "images/cumin.jpg", type: "aromatic" },
        { name: "Coriander", origin: "Madhya Pradesh", price: 180, image: "images/coriander.jpg", type: "medicinal" },
        { name: "Red Chilli", origin: "Andhra Pradesh", price: 250, image: "images/chilli.jpg", type: "hot" },
        { name: "Ginger", origin: "Kerala", price: 150, image: "images/ginger.jpg", type: "medicinal" },
        { name: "Nutmeg", origin: "Kerala", price: 800, image: "images/nutmeg.jpg", type: "aromatic" },
        { name: "Mace", origin: "Kerala", price: 1000, image: "images/mace.jpg", type: "aromatic" },
        { name: "Bay Leaf", origin: "India", price: 120, image: "images/bayleaf.jpg", type: "aromatic" },
        { name: "Fennel", origin: "Gujarat", price: 220, image: "images/fennel.jpg", type: "medicinal" },
        { name: "Mustard Seeds", origin: "Rajasthan", price: 150, image: "images/mustard.jpg", type: "hot" },
        { name: "Saffron", origin: "Kashmir", price: 2000, image: "images/saffron.jpg", type: "medicinal" },
        { name: "Star Anise", origin: "India", price: 600, image: "images/staranise.jpg", type: "aromatic" },
        { name: "Fenugreek", origin: "India", price: 180, image: "images/fenugreek.jpg", type: "medicinal" }
    ];

    const container = document.getElementById("spiceContainer");
    if (!container) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const searchInput = document.getElementById("searchInput");

    let filteredSpices = spices;

    // 🔍 Search
    if (searchInput && searchInput.value) {
        filteredSpices = filteredSpices.filter(spice =>
            spice.name.toLowerCase().includes(searchInput.value.toLowerCase())
        );
    }

    // 🏷 Filter
    if (currentFilter !== "all") {
        filteredSpices = filteredSpices.filter(spice => spice.type === currentFilter);
    }

    function renderSpices() {

        container.innerHTML = "";

        filteredSpices.forEach(spice => {
            let item = cartItems.find(i => i.product === spice.name);
            let qty = item ? item.quantity : 0;

            container.innerHTML += `
<div class="spice-card">

    <img src="${spice.image}">
    <h3>${spice.name}</h3>
    <p><strong>Origin:</strong> ${spice.origin}</p>
    <p><strong>Price:</strong> ₹${spice.price}/kg</p>

    <div id="cart-${spice.name.replace(/\s/g, '')}">
        <button onclick="addToCart('${spice.name}', ${spice.price})">
            Add to Cart
        </button>
        <span id="qty-${spice.name.replace(/\s/g, '')}" style="margin-left:10px;">
            ${qty > 0 ? "Qty: " + qty : ""}
        </span>
    </div>

</div>`;
        });
    }

    // ✅ FIRST RENDER (fixes missing images)
    renderSpices();

    // ✅ THEN FETCH CART (updates qty)
    if (user) {
        fetch(`http://localhost:3000/cart/${user.name}`)
            .then(res => res.json())
            .then(data => {
                cartItems = data;
                renderSpices();
            });
    }

    if (searchInput) {
        searchInput.oninput = loadSpices;
    }
}

// 🛒 ADD TO CART (DATABASE)
function addToCart(name, price) {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:3000/add-to-cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: user.name,
            product: name,
            price: price
        })
    })
        .then(res => res.json())
        .then(() => {

            alert(name + " added to cart");

            fetch(`http://localhost:3000/cart/${user.name}`)
                .then(res => res.json())
                .then(data => {

                    let item = data.find(i => i.product === name);
                    let qty = item ? item.quantity : 0;

                    const qtySpan = document.getElementById("qty-" + name.replace(/\s/g, ''));

                    if (qtySpan) {
                        qtySpan.innerText = "Qty: " + qty;
                    }

                });

        });
}

// 🧭 NAVBAR
function loadNavbar() {

    const user = JSON.parse(localStorage.getItem("user"));
    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    if (!user) {
        navbar.innerHTML = `
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="process.html">Export</a>
            <a href="contact.html">Contact</a>
            <a href="login.html">Login</a>
            <a href="signup.html">Signup</a>
        `;
    }

    else if (user.role === "user") {
        navbar.innerHTML = `
        <a href="index.html">Home</a>
        <a href="spices.html">Spices</a>
        <a href="enquiry.html">Enquiry</a>
        <a href="about.html">About</a>
        <a href="process.html">Export</a>
        <a href="contact.html">Contact</a>

        <a href="cart.html">🛒 Cart</a>
        <button onclick="logout()">Logout</button>
    `;
    }

    else if (user.role === "admin") {
        navbar.innerHTML = `
        <a href="dashboard.html">Dashboard</a>
        <a href="admin-orders.html">Orders</a>
        <a href="admin-users.html">Users</a>
        <a href="admin-enquiry.html">Enquiries</a>
        <a href="admin-contact.html">Contacts</a>
        <button onclick="logout()">Logout</button>
    `;
    }
    // 🔵 ACTIVE PAGE HIGHLIGHT
    setTimeout(() => {
        const links = document.querySelectorAll("#navbar a");
        const currentPage = window.location.pathname.split("/").pop();

        links.forEach(link => {
            const linkPage = link.getAttribute("href");

            if (linkPage === currentPage) {
                link.classList.add("active");
            }
        });
    }, 0);
}


// 🔒 PROTECT PAGE
function protectPages() {
    const user = JSON.parse(localStorage.getItem("user"));
    const path = window.location.pathname;

    if (path.includes("cart.html") && (!user || user.role !== "user")) {
        alert("Login required");
        window.location.href = "login.html";
    }
}

// 🔓 LOGOUT
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// 🔁 FILTER BUTTON
function filterSpices(type) {
    currentFilter = type;
    loadSpices();
}

// 🔐 SIGNUP
function signup() {
    const username = document.getElementById("newUsername").value;
    const usernamePattern = /^[A-Za-z]+$/;
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (username.trim() === "" || password.trim() === "") {
        alert("All fields are required ❌");
        return;
    }

    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{6,}$/;

    fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            window.location.href = "login.html";
        });
}

// 🔐 LOGIN
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username.trim() === "" || password.trim() === "") {
        alert("Please fill all fields ❌");
        return;
    }

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
        .then(res => res.json())
        .then(data => {

            if (data.message === "Login successful ✅") {

                localStorage.setItem("user", JSON.stringify({
                    name: username,
                    role: data.role
                }));

                alert("Login successful ✅");

                // 👑 ADMIN → dashboard
                if (data.role === "admin") {
                    window.location.href = "dashboard.html";
                }
                // 👤 USER → home
                else {
                    window.location.href = "index.html";
                }
            } else {
                alert(data.message);
            }
        });
}

// 🛒 LOAD CART PAGE
function loadCartPage() {

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const table = document.querySelector("#cartTable tbody");
    const totalEl = document.getElementById("grandTotal");

    if (!table) return;

    fetch(`http://localhost:3000/cart/${user.name}`)
        .then(res => res.json())
        .then(data => {

            table.innerHTML = "";
            let total = 0;

            data.forEach(item => {
                let t = item.price * item.quantity;
                total += t;

                table.innerHTML += `
<tr>
    <td>${item.product}</td>
    <td>${item.price}</td>
    <td>
    <button onclick="updateQuantity('${item.product}', 'decrease')">➖</button>
    ${item.quantity}
    <button onclick="updateQuantity('${item.product}', 'increase')">➕</button>
</td>
    <td>${t}</td>
</tr>`;
            });

            totalEl.innerText = "Grand Total: ₹ " + total;
        });
}

function updateQuantity(product, action) {

    const user = JSON.parse(localStorage.getItem("user"));

    fetch("http://localhost:3000/update-cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: user.name,
            product: product,
            action: action
        })
    })
        .then(res => res.json())
        .then(data => {
            loadCartPage(); // refresh cart
        })
        .catch(err => console.error(err));
}

function placeOrder(method) {

    const user = JSON.parse(localStorage.getItem("user"));

    fetch("http://localhost:3000/place-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: user.name,
            paymentMethod: method
        })
    })
        .then(res => res.json())
        .then(data => {

            alert(data.message);

            if (data.message.includes("success")) {
                // window.location.href = "index.html";
            }

        })
        .catch(err => console.error(err));
}
function loadOrders() {

    const table = document.querySelector("#ordersTable tbody");
    if (!table) return;

    fetch("http://localhost:3000/orders")
        .then(res => res.json())
        .then(data => {

            table.innerHTML = "";

            data.forEach(order => {

                let items = order.items.map(i => i.product + " (" + i.quantity + ")").join(", ");

                table.innerHTML += `
<tr>
    <td>${order.username}</td>
    <td>${items}</td>
    <td>${order.total}</td>
    <td>${order.paymentMethod}</td>
    <td>${new Date(order.date).toLocaleString()}</td>
</tr>
`;
            });

        });
}

function loadUsers() {

    const table = document.querySelector("#usersTable tbody");
    if (!table) return;

    fetch("http://localhost:3000/users")
        .then(res => res.json())
        .then(data => {

            table.innerHTML = "";

            data.forEach(user => {
                table.innerHTML += `
<tr>
    <td>${user.username}</td>
    <td>${user.password}</td>
</tr>
`;
            });

        });
}

function loadEnquiries() {

    const table = document.querySelector("#enquiryTable tbody");
    if (!table) return;

    fetch("http://localhost:3000/api/enquiries")
        .then(res => res.json())
        .then(data => {

            table.innerHTML = "";

            data.forEach(item => {
                table.innerHTML += `
<tr>
    <td>${item.name}</td>
    <td>${item.email}</td>
    <td>${item.phone}</td>
    <td>${item.product}</td>
    <td>${item.quantity}</td>
    <td>${item.country}</td>
    <td>
        <button onclick="deleteEnquiry('${item._id}')">Delete</button>
    </td>
</tr>
`;
            });

        });
}

function deleteEnquiry(id) {

    fetch(`http://localhost:3000/enquiry/${id}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadEnquiries();
        });
}

function loadContacts() {

    const table = document.querySelector("#contactTable tbody");
    if (!table) return;

    fetch("http://localhost:3000/contacts")
        .then(res => res.json())
        .then(data => {

            table.innerHTML = "";

            data.forEach(item => {
                table.innerHTML += `
<tr>
    <td>${item.name}</td>
    <td>${item.email}</td>
    <td>${item.message}</td>
</tr>
`;
            });

        });
}

function submitEnquiry() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter valid 10-digit phone number ❌");
        return;
    }
    const product = document.getElementById("product").value;
    const quantity = document.getElementById("quantity").value;
    const country = document.getElementById("country").value;

    fetch("http://localhost:3000/api/enquiries", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name, email, phone, product, quantity, country
        })
    })
        .then(res => res.json())
        .then(() => {

            alert("Enquiry submitted successfully ✅");

            // ✅ clear form
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("product").value = "";
            document.getElementById("quantity").value = "";
            document.getElementById("country").value = "";

            // ✅ remove validation messages
            document.querySelectorAll(".error-text").forEach(el => {
                el.style.display = "none";
            });

            // ✅ reset borders
            document.querySelectorAll(".signup-container input")
                .forEach(input => {
                    input.style.border = "1px solid #ccc";
                });

        });
}

function submitContact() {

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    if (!emailPattern.test(email)) {
        alert("Enter valid email ❌");
        return;
    }
    const message = document.getElementById("contactMessage").value;

    fetch("http://localhost:3000/contacts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name, email, message
        })
    })
        .then(res => res.json())
        .then(() => {

            alert("Message sent successfully ✅");

            // ✅ clear form
            document.getElementById("contactName").value = "";
            document.getElementById("contactEmail").value = "";
            document.getElementById("contactMessage").value = "";

            // ✅ hide validation text
            document.querySelectorAll(".error-text")
                .forEach(el => {
                    el.style.display = "none";
                });

            // ✅ reset borders
            document.querySelectorAll(".signup-container input, .signup-container textarea")
                .forEach(el => {
                    el.style.border = "1px solid #ccc";
                });

        });
}
function payNow() {

    const user = JSON.parse(localStorage.getItem("user"));

    // 🔥 get total from UI
    const totalText = document.getElementById("grandTotal").innerText;

    const amount = parseInt(totalText.replace(/\D/g, "")); // extract number

    fetch("http://localhost:3000/create-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount })
    })
        .then(res => res.json())
        .then(order => {

            const options = {
                key: "rzp_test_SdVUDXS0nRXGKT",
                amount: order.amount,
                currency: "INR",
                order_id: order.id,

                name: "IndoAroma Exports",
                description: "Spices Payment",

                handler: async function (response) {

                    const user =
                        JSON.parse(localStorage.getItem("user"));

                    const username = user.name;

                    // save order
                    await placeOrder("Online Payment");

                    cart = [];

                    localStorage.removeItem("cart");

                    document.getElementById("cartTableBody").innerHTML = "";

document.getElementById("grandTotal").innerText =
    "Grand Total: ₹0";

document.getElementById("emptyCartMsg").innerText =
    "Your cart is empty";

                    setTimeout(() => {

                        location.reload();

                    }, 500);

                    // auto open/download receipt
                    setTimeout(() => {

    window.location.href =
        `http://localhost:3000/receipt/${username}`;

}, 1000);
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        });
}

function togglePassword() {

    const password = document.getElementById("newPassword");

    if (password.type === "password") {
        password.type = "text";
    }
    else {
        password.type = "password";
    }
}
const usernameInput = document.getElementById("newUsername");

if (usernameInput) {

    usernameInput.addEventListener("input", () => {

        const username = usernameInput.value;
        const error = document.getElementById("usernameError");

        // only letters
        const usernamePattern = /^[A-Za-z]+$/;

        if (username === "") {

            error.innerText = "Username cannot be blank";
            error.style.color = "red";
            usernameInput.style.border = "2px solid red";
        }

        else if (!usernamePattern.test(username)) {

            error.innerText = "Only letters allowed";
            error.style.color = "red";
            usernameInput.style.border = "2px solid red";
        }
        else {

            error.innerText = "Valid username ✓";
            error.style.color = "green";
            usernameInput.style.border = "2px solid green";
        }

    });

}

const passwordInput = document.getElementById("newPassword");

if (passwordInput) {

    passwordInput.addEventListener("input", () => {

        const password = passwordInput.value;
        const error = document.getElementById("passwordError");

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{6,}$/;

        if (password === "") {

            error.innerText = "Password cannot be blank";
            error.style.color = "red";
            passwordInput.style.border = "2px solid red";
        }

        else if (!passwordPattern.test(password)) {

            error.innerText =
                "Use uppercase, lowercase, number & symbol";

            error.style.color = "red";
            passwordInput.style.border = "2px solid red";
        }

        else {

            error.innerText = "Strong password ✓";
            error.style.color = "green";
            passwordInput.style.border = "2px solid green";
        }

    });

}

const confirmInput = document.getElementById("confirmPassword");

if (confirmInput) {

    confirmInput.addEventListener("input", () => {

        const password =
            document.getElementById("newPassword").value;

        const confirmPassword = confirmInput.value;

        const error =
            document.getElementById("confirmError");

        if (confirmPassword === "") {

            error.innerText = "Confirm your password";
            error.style.color = "red";
            confirmInput.style.border = "2px solid red";
        }

        else if (password !== confirmPassword) {

            error.innerText = "Passwords do not match ❌";
            error.style.color = "red";
            confirmInput.style.border = "2px solid red";
        }

        else {

            error.innerText = "Passwords match ✓";
            error.style.color = "green";
            confirmInput.style.border = "2px solid green";
        }

    });

}

const loginUsername = document.getElementById("username");

if (loginUsername) {

    loginUsername.addEventListener("input", () => {

        const username = loginUsername.value;
        const error =
            document.getElementById("loginUsernameError");

        const usernamePattern = /^[A-Za-z]+$/;

        if (username === "") {

            error.innerText = "Username cannot be blank";
            error.style.color = "red";
            loginUsername.style.border = "2px solid red";
        }

        else if (!usernamePattern.test(username)) {

            error.innerText = "Only letters allowed";
            error.style.color = "red";
            loginUsername.style.border = "2px solid red";
        }

        else if (
            username.charAt(0) !==
            username.charAt(0).toUpperCase()
        ) {

            error.innerText =
                "First letter should be capital";

            error.style.color = "red";
            loginUsername.style.border = "2px solid red";
        }

        else {

            error.innerText = "Valid username ✓";
            error.style.color = "green";
            loginUsername.style.border = "2px solid green";
        }

    });

}

const loginPassword = document.getElementById("password");

if (loginPassword) {

    loginPassword.addEventListener("input", () => {

        const password = loginPassword.value;

        const error =
            document.getElementById("loginPasswordError");

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{6,}$/;

        if (password === "") {

            error.innerText = "Password cannot be blank";

            error.style.color = "red";

            loginPassword.style.border =
                "2px solid red";
        }

        else if (!passwordPattern.test(password)) {

            error.innerText =
                "Weak password format";

            error.style.color = "red";

            loginPassword.style.border =
                "2px solid red";
        }

        else {

            error.innerText = "Valid password ✓";

            error.style.color = "green";

            loginPassword.style.border =
                "2px solid green";
        }

    });

}

function toggleLoginPassword() {

    const password =
        document.getElementById("password");

    if (password.type === "password") {

        password.type = "text";
    }

    else {

        password.type = "password";
    }
}

const enquiryName = document.getElementById("name");

if (enquiryName) {

    enquiryName.addEventListener("input", () => {

        const name = enquiryName.value;

        const error =
            document.getElementById("nameError");

        const namePattern = /^[A-Za-z ]+$/;

        if (name === "") {

            error.style.display = "block";
            error.innerText = "Name cannot be blank";
            error.style.color = "red";

            enquiryName.style.border =
                "2px solid red";
        }

        else if (!namePattern.test(name)) {

            error.style.display = "block";
            error.innerText =
                "Only letters allowed";

            error.style.color = "red";

            enquiryName.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";
            error.innerText = "Valid name ✓";

            error.style.color = "green";

            enquiryName.style.border =
                "2px solid green";
        }

    });

}
const enquiryEmail = document.getElementById("email");

if (enquiryEmail) {

    enquiryEmail.addEventListener("input", () => {

        const email = enquiryEmail.value;

        const error =
            document.getElementById("emailError");

        const emailPattern =
            /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

        if (email === "") {

            error.style.display = "block";
            error.innerText =
                "Email cannot be blank";

            error.style.color = "red";

            enquiryEmail.style.border =
                "2px solid red";
        }

        else if (!emailPattern.test(email)) {

            error.style.display = "block";
            error.innerText =
                "Enter valid email";

            error.style.color = "red";

            enquiryEmail.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";
            error.innerText = "Valid email ✓";

            error.style.color = "green";

            enquiryEmail.style.border =
                "2px solid green";
        }

    });

}
const enquiryPhone = document.getElementById("phone");

if (enquiryPhone) {

    enquiryPhone.addEventListener("input", () => {

        const phone = enquiryPhone.value;

        const error =
            document.getElementById("phoneError");

        const phonePattern = /^[0-9]{10}$/;

        if (phone === "") {

            error.style.display = "block";
            error.innerText =
                "Phone number cannot be blank";

            error.style.color = "red";

            enquiryPhone.style.border =
                "2px solid red";
        }

        else if (!phonePattern.test(phone)) {

            error.style.display = "block";
            error.innerText =
                "Enter valid 10-digit number";

            error.style.color = "red";

            enquiryPhone.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";
            error.innerText =
                "Valid phone number ✓";

            error.style.color = "green";

            enquiryPhone.style.border =
                "2px solid green";
        }

    });

}

const enquiryQuantity =
    document.getElementById("quantity");

if (enquiryQuantity) {

    enquiryQuantity.addEventListener("input", () => {

        const quantity = enquiryQuantity.value;

        const error =
            document.getElementById("quantityError");

        if (quantity === "") {

            error.style.display = "block";
            error.innerText =
                "Quantity cannot be blank";

            error.style.color = "red";

            enquiryQuantity.style.border =
                "2px solid red";
        }

        else if (
            isNaN(quantity) || Number(quantity) <= 0
        ) {

            error.style.display = "block";
            error.innerText =
                "Enter valid quantity";

            error.style.color = "red";

            enquiryQuantity.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";
            error.innerText =
                "Valid quantity ✓";

            error.style.color = "green";

            enquiryQuantity.style.border =
                "2px solid green";
        }

    });

}

const enquiryProduct =
    document.getElementById("product");

if (enquiryProduct) {

    enquiryProduct.addEventListener("input", () => {

        const product = enquiryProduct.value;

        const error =
            document.getElementById("productError");

        const productPattern = /^[A-Za-z ]+$/;

        if (product === "") {

            error.style.display = "block";
            error.innerText =
                "Product name cannot be blank";

            error.style.color = "red";

            enquiryProduct.style.border =
                "2px solid red";
        }

        else if (!productPattern.test(product)) {

            error.style.display = "block";
            error.innerText =
                "Only letters allowed";

            error.style.color = "red";

            enquiryProduct.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";
            error.innerText =
                "Valid product name ✓";

            error.style.color = "green";

            enquiryProduct.style.border =
                "2px solid green";
        }

    });

}

const contactName =
    document.getElementById("contactName");

if (contactName) {

    contactName.addEventListener("input", () => {

        const name = contactName.value;

        const error =
            document.getElementById("contactNameError");

        const namePattern = /^[A-Za-z ]+$/;

        if (name === "") {

            error.style.display = "block";
            error.innerText =
                "Name cannot be blank";

            error.style.color = "red";

            contactName.style.border =
                "2px solid red";
        }

        else if (!namePattern.test(name)) {

            error.style.display = "block";
            error.innerText =
                "Only letters allowed";

            error.style.color = "red";

            contactName.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";
            error.innerText =
                "Valid name ✓";

            error.style.color = "green";

            contactName.style.border =
                "2px solid green";
        }

    });

}

const contactEmail =
    document.getElementById("contactEmail");

if (contactEmail) {

    contactEmail.addEventListener("input", () => {

        const email = contactEmail.value;

        const error =
            document.getElementById("contactEmailError");

        const emailPattern =
            /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

        if (email === "") {

            error.style.display = "block";

            error.innerText =
                "Email cannot be blank";

            error.style.color = "red";

            contactEmail.style.border =
                "2px solid red";
        }

        else if (!emailPattern.test(email)) {

            error.style.display = "block";

            error.innerText =
                "Enter valid email";

            error.style.color = "red";

            contactEmail.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";

            error.innerText =
                "Valid email ✓";

            error.style.color = "green";

            contactEmail.style.border =
                "2px solid green";
        }

    });

}

const contactMessage =
    document.getElementById("contactMessage");

if (contactMessage) {

    contactMessage.addEventListener("input", () => {

        const message = contactMessage.value;

        const error =
            document.getElementById("contactMessageError");

        if (message.trim() === "") {

            error.style.display = "block";

            error.innerText =
                "Message cannot be blank";

            error.style.color = "red";

            contactMessage.style.border =
                "2px solid red";
        }

        else {

            error.style.display = "block";

            error.innerText =
                "Valid message ✓";

            error.style.color = "green";

            contactMessage.style.border =
                "2px solid green";
        }

    });

}
