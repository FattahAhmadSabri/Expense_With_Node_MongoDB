const User = require("../model/userSchema");
const { ForgotPassword } = require("../model/forgotPassword");
const { hashPassword, comparePassword } = require("../middleware/bcryptConfig");
const sendEmail = require("./emailService");
const mongoose = require("mongoose");

const createUserService = async (name, email, password) => {
  const hashedPassword = await hashPassword(password);
  const result = await User.create({ name, email, password: hashedPassword });
  return result;
};

const loginService = async (email, password) => {
  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    return false;
  }

  const comparedPassword = await comparePassword(password, user.password);
  console.log(comparedPassword);
  if (!comparedPassword) {
    return false;
  }

  return user;
};

const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    return false;
  }

  try {
    // Deactivate previous active reset requests
    await ForgotPassword.updateMany(
      {
        userId: user._id,
        isActive: true,
      },
      {
        $set: { isActive: false },
      },
    );

    // Create a new reset request
    const resetRequest = await ForgotPassword.create({
      userId: user._id,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    // Send reset password email
    await sendEmail(
      user.email,
      "Reset Password",
      `
        <a href="http://localhost:5500/frontend/login/reset-password.html?id=${resetRequest._id}">
          Reset Password
        </a>
      `,
    );

    return true;
  } catch (error) {
    throw error;
  }
};

const updatePasswordService = async (resetId, password) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const resetRequest =
      await ForgotPassword.findById(resetId).session(session);

    if (!resetRequest) {
      throw new Error("Invalid reset link");
    }

    if (!resetRequest.isActive) {
      throw new Error("Reset link has already been used");
    }

    if (resetRequest.expiresAt <= new Date()) {
      throw new Error("Reset link has expired");
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.findById(resetRequest.userId).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    user.password = hashedPassword;
    await user.save({ session });

    resetRequest.isActive = false;
    await resetRequest.save({ session });

    await session.commitTransaction();

    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const getUserByIdService = async (id) => {
  const response = await User.findById(id).select("name email isPremium");
  return response;
};

module.exports = {
  createUserService,
  loginService,
  forgotPasswordService,
  updatePasswordService,
  getUserByIdService,
};
