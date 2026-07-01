const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ROLES = require("../config/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must not exceed 80 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^\+?[0-9]{10,15}$/,
        "Phone number must be between 10 and 15 digits",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in query results unless explicitly requested
    },

    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: "Role must be either caretaker or admin",
      },
      default: ROLES.CARETAKER,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: true,     // Reject any fields not defined in this schema
  }
);

// Hash the password before saving. Only runs if the password field was modified,
// so update operations that don't touch the password are not affected.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/**
 * Compare a plain-text password against the stored hash.
 *
 * @param {string} candidatePassword - The password submitted during login
 * @returns {Promise<boolean>} True if the password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;