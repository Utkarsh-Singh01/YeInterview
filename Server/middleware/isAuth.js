import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;

    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        message: "User does not have valid token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    req.userId = userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "User does not have valid token",
    });
  }
};

export default isAuth;