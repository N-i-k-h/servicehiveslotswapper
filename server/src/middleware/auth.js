import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT and attach user info to the request
 */
export function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Handle both "sub" and "id" fields for backward compatibility
    const userId = payload.sub || payload.id;

    if (!userId) {
      console.error("❌ JWT missing sub/id field. Payload:", payload);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // ✅ Attach user data to the request object
    req.user = {
      id: userId,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * Function to sign a new JWT token for a user
 */
export function signJwt(user) {
  try {
    return jwt.sign(
      {
        // Use `sub` for standard JWT field
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  } catch (err) {
    console.error("❌ JWT signing failed:", err.message);
    throw err;
  }
}
