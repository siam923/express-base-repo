// src/routes/auth.js
import express from "express";
import {
  getProfile,
  forgotPassword,
  login,
  refreshToken,
  register,
  resetPassword,
} from "#src/common/controllers/authController.js";
import { getUserByToken, updateUser } from "#src/common/controllers/userController.js";

import authMiddleware from "#src/common/middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth route" });
});
router.post("/getUser", getProfile);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
// password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// user update 
router.put("/update", authMiddleware, updateUser);
router.get("/user/", authMiddleware, getUserByToken);

export default router;
