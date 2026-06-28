const mongoose = require("mongoose");
const { PAYMENT_STATUS } = require("../utils/constants");

// Each document represents one payment attempt — whether successful or failed.
// This gives the caretaker and admin a full billing history.
const paymentSchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: [true, "Payment must be linked to a subscription"],
      index: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Payment must be linked to a property"],
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Payment must be linked to a user"],
      index: true,
    },

    // The unique transaction reference from OPay — used to match webhook events
    // and prevent duplicate processing.
    opayTransactionReference: {
      type: String,
      required: [true, "OPay transaction reference is required"],
      unique: true,
      trim: true,
    },

    // Amount charged in kobo (100 kobo = 1 Naira). Never store money as a float.
    amountKobo: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_STATUS),
        message: "Payment status must be pending, success, or failed",
      },
      default: PAYMENT_STATUS.PENDING,
    },

    // Human-readable status detail returned by OPay (e.g. "Insufficient funds").
    statusMessage: {
      type: String,
      trim: true,
      default: null,
    },

    // The date OPay processed this payment, as reported in the webhook payload.
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;