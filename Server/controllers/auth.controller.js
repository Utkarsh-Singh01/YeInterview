import genToken from "../config/token.js";
import User from "../models/user.model.js";

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || "User",
        email,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Google auth error ${error.message || error}`,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", getCookieOptions());

    return res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Logout error ${error.message || error}`,
    });
  }
};