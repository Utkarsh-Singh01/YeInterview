import jwt from "jsonwebtoken";

const genToken = async (userId) => {
   try {
     const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
     return token;
     
   } catch (error) {
     console.error("Token Generation Error:", error);
     throw new Error("Failed to generate token");
   }
}

export default genToken;