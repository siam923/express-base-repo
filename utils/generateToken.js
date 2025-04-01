// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  const tokenPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "30d", // 3h for testing
  });

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { token, refreshToken };
};
