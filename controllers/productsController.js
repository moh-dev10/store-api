const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

// ================= GET ALL PRODUCTS (With Filtering & Pagination) =================
const getProducts = async (req, res, next) => {
    try {
        const { name, price } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build dynamic query filters safely
        const where = {
            ...(name && {
                name: {
                    contains: name,
                    mode: "insensitive" // Case-insensitive search
                }
            }),
            ...(price && {
                price: Number(price)
            })
        };

        // Fetch products and total count concurrently for better performance (Promise.all)
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.product.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        next(error);
    }
};

// ================= GET SINGLE PRODUCT BY ID =================
const getProductById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        next(error);
    }
};

// ================= CREATE PRODUCT =================
const createProduct = async (req, res, next) => {
    try {
        const { name, price } = req.body;

        if (!name || price === undefined) {
            throw new AppError("Name and price are required", 400);
        }

        const numericPrice = Number(price);

        if (Number.isNaN(numericPrice) || numericPrice <= 0) {
            throw new AppError("Price must be a positive number", 400);
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                price: numericPrice,
                userId: req.user.id // Linked to authenticated user
            }
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });

    } catch (error) {
        next(error);
    }
};

// ================= UPDATE PRODUCT =================
const updateProduct = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { name, price } = req.body;

        // 1. Verify product exists AND belongs to the logged-in user (Security / Authorization)
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        if (!existingProduct) {
            throw new AppError("Product not found or unauthorized", 404);
        }

        // 2. Build update payload dynamically
        const data = {};

        if (name !== undefined) {
            data.name = name;
        }

        if (price !== undefined) {
            const numericPrice = Number(price);

            if (Number.isNaN(numericPrice) || numericPrice <= 0) {
                throw new AppError("Price must be a positive number", 400);
            }

            data.price = numericPrice;
        }

        // 3. Perform the update safely using the unique ID
        const updatedProduct = await prisma.product.update({
            where: { id },
            data
        });

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        next(error);
    }
};

// ================= DELETE PRODUCT =================
const deleteProduct = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        // 1. Verify ownership before deletion
        const product = await prisma.product.findFirst({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        if (!product) {
            throw new AppError("Product not found or unauthorized", 404);
        }

        // 2. Delete product
        const deletedProduct = await prisma.product.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product: deletedProduct
        });

    } catch (error) {
        next(error);
    }
};

// ================= GET DASHBOARD STATS =================
const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Use Promise.all to run database queries in parallel (Super fast performance!)
        const [totalProducts, totalValue, latestProducts] = await Promise.all([
            prisma.product.count({ where: { userId } }),
            prisma.product.aggregate({
                where: { userId },
                _sum: { price: true }
            }),
            prisma.product.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5
            })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalValue: totalValue._sum.price || 0,
                latestProducts
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getDashboard
};