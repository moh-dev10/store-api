const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError"); // Optional: ila bghit tstakhdem global error handler

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 1. Check if Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided or invalid format."
            });
        }

        // 2. Extract token safely after "Bearer "
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token is missing."
            });
        }

        // 3. Verify JWT token against secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach decoded user payload to request object
        req.user = decoded;

        // 5. Move to the next middleware or controller
        next();

    } catch (error) {
        // Handle expired or malformed tokens professionally
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please login again."
        });
    }
};

module.exports = authMiddleware;