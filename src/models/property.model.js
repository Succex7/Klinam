const mongoose = require("mongoose");
const { BIN_STATUS } = require("../utils/constants");

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Property must belong to a user"],
      index: true, // Indexed because we query by owner frequently
    },

    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      minlength: [2, "Property name must be at least 2 characters"],
      maxlength: [100, "Property name must not exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },

    // Free-text address description as specified in the product brief.
    // e.g. "Opposite FUNAAB Gate, beside Mr Biggs, the blue building"
    locationDescription: {
      type: String,
      required: [true, "Location description is required"],
      trim: true,
      maxlength: [300, "Location description must not exceed 300 characters"],
    },

    binStatus: {
      type: String,
      enum: {
        values: Object.values(BIN_STATUS),
        message: "Bin status must be either empty or filled",
      },
      default: BIN_STATUS.EMPTY,
    },

    // Tracks when the bin was last reported full.
    lastReportedFullAt: {
      type: Date,
      default: null,
    },

    // Tracks when the bin was last emptied by the operations team.
    lastEmptiedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Compound index: ensures no caretaker registers two properties with the same name.
propertySchema.index({ owner: 1, name: 1 }, { unique: true });

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;