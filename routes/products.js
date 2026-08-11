const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { 
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct 
} = require("../controllers/productsController");

router.get("/my-products",authMiddleware,getProducts);
router.get("/:id",authMiddleware,getProductById);
router.post("/",authMiddleware,createProduct);
router.patch("/:id",authMiddleware,updateProduct);
router.delete("/:id",authMiddleware,deleteProduct)


module.exports = router;