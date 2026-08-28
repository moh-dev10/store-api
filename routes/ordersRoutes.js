const express = require("express");

const router = express.Router();

const authMiddlerware = require("../middleware/authMiddleware");

const {
    createOrder,
    getMyorders,
    getOrderById
} = require("../controllers/ordersController");

router.post("/", authMiddlerware, createOrder);

router.get("/my-orders",authMiddlerware, getMyorders);

router.get("/:id",authMiddlerware,getOrderById);

module.exports = router;