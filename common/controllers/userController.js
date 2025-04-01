import User from "#src/models/User.js";
import catchAsync from "#src/utils/catchAsync.js";


/**
 * Update User Details (e.g., name)
 */
const updateUser = catchAsync(async (req, res) => {
  const userId = req.user.id; // Assuming authentication middleware sets req.user

  const { name, email, phone } = req.body; // Add other user-related fields as needed

  // Define allowed fields for update
  const allowedUpdates = {};

  if (name !== undefined) allowedUpdates.name = name;
  if (phone !== undefined) allowedUpdates.phone = phone;
  // Add other user-related fields here

  // If no valid fields are provided for update, respond with an error
  if (Object.keys(allowedUpdates).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  // Fetch the user from the database
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Apply updates to the user object
  for (const key in allowedUpdates) {
    user[key] = allowedUpdates[key];
  }

  // Save the updated user to the database
  await user.save();

  // Prepare the user object for the response by removing sensitive fields
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpires;

  // Send the response
  res.json({
    message: "User updated successfully."
  });
});



const getUserByToken = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpires");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

export { updateUser, getUserByToken };
