const mongoose = require("mongoose");
const { COLLECTION_STATUS } = require("../utils/constants");

// One document represents one full collection cycle for a property:
// from the moment the caretaker reports the bin as full, to the moment
// the admin marks it as emptied after the truck visits.
const collectionRequestSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Collection request must be linked to a property"],
      index: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Collection request must have a reporting user"],
    },

    // Set when the admin clicks "Mark as Emptied".
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(COLLECTION_STATUS),
        message: "Collection status must be pending or completed",
      },
      default: COLLECTION_STATUS.PENDING,
    },

    // When the caretaker reported the bin as full.
    reportedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // When the admin marked the bin as emptied.
    resolvedAt: {
      type: Date,
      default: null,
    },

    // Optional note from the caretaker when reporting (e.g. "waste overflowing").
    caretakerNote: {
      type: String,
      trim: true,
      maxlength: [200, "Note must not exceed 200 characters"],
      default: null,
    },

    // Optional note from the admin when resolving (e.g. "missed first attempt").
    adminNote: {
      type: String,
      trim: true,
      maxlength: [200, "Note must not exceed 200 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const CollectionRequest = mongoose.model(
  "CollectionRequest",
  collectionRequestSchema
);

module.exports = CollectionRequest;