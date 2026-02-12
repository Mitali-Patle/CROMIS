import jwt from "jsonwebtoken";

/**
 * Auth middleware
 * Supports:
 *  - JWT in httpOnly cookies (frontend – Next.js)
 *  - JWT in Authorization header (Postman / API clients)
 */
export default function auth(req, res, next) {
  try {
    let token = null;

    // 1️⃣ Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2️⃣ If not found, check cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 3️⃣ If no token → Unauthorized
    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Attach user payload to request
    // Expected payload: { id, role, email }
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}

// Named export for backward compatibility
export const protect = auth;
