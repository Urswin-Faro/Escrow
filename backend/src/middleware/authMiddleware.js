// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Middleware to protect routes (verify JWT and attach user info)
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user to the request object (without password)
      // Use findUserById to get the latest user data from DB
      const user = await userModel.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      // Important: Attach a simplified user object to req.user
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role, // Keep the role for dashboard routing
      };

      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      res.status(403).json({ message: "Invalid or expired token." });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Authentication token is required." });
  }
};

// You can add an authorization middleware (e.g., for admin role) here if needed
exports.authorize = (roles = []) => {
  // roles can be a single string or an array of roles
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // If no roles specified, everyone is authorized
    if (roles.length === 0) {
      return next();
    }

    // Check if user role is included in the authorized roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient permissions." });
    }

    next();
  };
};
