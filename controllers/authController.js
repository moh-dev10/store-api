const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

// ================= REGISTER CONTROLLER =================
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists (Prevent duplicate emails gracefully)
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new AppError("Email is already registered. Please login.", 400);
        }

        // 2. Hash the password securely (salt rounds = 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create new user in PostgreSQL via Prisma
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        // 4. Send professional success response (Never send password back!)
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        next(error);
    }
};

// ================= LOGIN CONTROLLER =================
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Security Tip: Don't specify whether email or password was wrong 
        // to prevent user enumeration attacks by hackers.
        if (!user) {
            throw new AppError("Invalid email or password", 401);
        }

        // 2. Compare incoming password with stored hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            throw new AppError("Invalid email or password", 401);
        }

        // 3. Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            throw new AppError("Internal server configuration error", 500);
        }

        // 4. Sign JWT Token (Valid for 1 day / 24h for e-commerce user sessions)
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 5. Send success response with token
        res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};