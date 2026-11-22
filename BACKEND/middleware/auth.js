import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Not authorized, no token",
                status: 401,
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Token is missing",
                status: 401,
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found",
                status: 401,
            });
        }

        req.user = user;
        return next();

    } catch (error) {
        console.error("Auth middleware error:", error.name, error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                error: "Token has expired",
                status: 401,
            });
        }

        return res.status(401).json({
            success: false,
            error: "Not authorized, token failed",
            status: 401,
        });
    }
};

export default protect;
