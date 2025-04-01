// src/controllers/authController.js

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "#src/models/User.js";
import { generateTokens } from "#src/utils/generateToken.js";
import catchAsync from "#src/utils/catchAsync.js";


// Register User
const register = catchAsync(async (req, res) => {
  const { name, email, password, role="customer" } = req.body;
  // console.log(req.body);

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password,
      role,
    });
    await user.save();

    res.json({ message: "User registered" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error registering user");
  }
});

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { token, refreshToken } = generateTokens(user);

    // Build user object dynamically
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Only include vendorId if it exists
    if (user.vendorId) {
      userData.vendorId = user.vendorId;
    }

    res.json({
      token,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error logging in");
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  const { token: refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send("Refresh token required");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).send("Invalid refresh token");
    }

    const { token, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error refreshing token");
  }
};

// Check if User Exists
const getProfile = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user details
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Create HTML template for password reset email
    const htmlTemplate = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Thank you!</p>
    `;

    // Create plain text version
    const textVersion = `
      Password Reset Request
      
      You requested a password reset. Click the following link to reset your password:
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
      
      Thank you!
    `;

    // Send email using the sendEmail service
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: textVersion,
      html: htmlTemplate
  });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ 
      message: "Error sending reset email",
      error: error.message 
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
    throw new Error('User not found');
  }
});


export {
  register,
  login,
  refreshToken, // Export with original name
  getProfile,
  forgotPassword,
  resetPassword,
  updateUserRole
};
