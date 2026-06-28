const mongoose = require("mongoose");
const { SUBSCRIPTION_STATUS } = require("../utils/constants");

// One subscription document per property. This stores the OPay recurring
// billing mandate, not individual payment records — those live in Payment.model.js.
const subscriptionSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Subscription must be linked to a property"],
      unique: true, // One active subscription per property at a time
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Subscription must be linked to a user"],
      index: true,
    },

    // The mandate reference returned by OPay when the caretaker approves
    // the recurring billing setup.
    opayMandateId: {
      type: String,
      required: [true, "OPay mandate ID is required"],
      trim: true,
    },

    // The OPay customer/account reference tied to the caretaker's OPay account.
    opayCustomerReference: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(SUBSCRIPTION_STATUS),
        message: "Subscription status must be active, inactive, or failed",
      },
      default: SUBSCRIPTION_STATUS.INACTIVE,
    },

    // Monthly subscription amount in Naira (stored in kobo to avoid float math).
    amountKobo: {
      type: Number,
      required: [true, "Subscription amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    activatedAt: {
      type: Date,
      default: null,
    },

    nextBillingDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;