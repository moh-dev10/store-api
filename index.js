require("dotenv").config();

const express = require("express");

const app = express();

const dashboardRoutes = require("./routes/dashboardRouter");

const productsRoutes = require("./routes/products");

const authRoutes = require("./routes/authRoutes");

const errorHandler = require("./middleware/errorHandler");



app.use(express.json());

app.use("/dashboard", dashboardRoutes);
app.use("/products", productsRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

app.listen(3000,() =>{
    console.log("Server is running on port 3000");
});

