const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");


const getProducts = async (req, res, next) => {
    try {
        const { name, price } = req.query;

        const products = await prisma.product.findMany({
            where: {
                ...(name && {
                    name: {
                        contains: name,
                        mode: "insensitive"
                    }
                }),

                ...(price && {
                    price: Number(price)
                })
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        res.json(products);

    } catch (error) {
        next(error);
    }
};


const getProductById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const product = await prisma.product.findUnique({
            where: {
                id
            }
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        res.json(product);

    } catch (error) {
        next(error);
    }
};


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
                userId: req.user.id
            }
        });

        res.status(201).json(newProduct);

    } catch (error) {
        next(error);
    }
};


const updateProduct = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { name, price } = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: {
                id
            }
        });

        if (!existingProduct) {
            throw new AppError("Product not found", 404);
        }

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

        const updatedProduct = await prisma.product.update({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        res.json(updatedProduct);

    } catch (error) {
        next(error);
    }
};


const deleteProduct = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const product = await prisma.product.findFirst({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        const deletedProduct = await prisma.product.delete({
            where: {
                id
            }
        });

        res.json({
            message: "Product deleted",
            product: deletedProduct
        });

    } catch (error) {
        next(error);
    }
};

const getDashboard = async (req, res, next) => {
    try {
        const totalProducts = await prisma.product.count({
            where: {
                userId: req.user.id
            }
        });

        const totalValue = await prisma.product.aggregate({
            where: {
                userId: req.user.id
            },
            _sum: {
                price: true
            }
        });

        const latestProducts = await prisma.product.findMany({
            where: {
                userId: req.user.id
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 5
        });

        res.json({
            totalProducts,
            totalValue: totalValue._sum.price || 0,
            latestProducts
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