const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");



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
    getDashboard
};