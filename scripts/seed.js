require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User.model");
const Property = require("../src/models/Property.model");
const ROLES = require("../src/config/roles");

// This script populates the database with a default admin account and
// sample caretaker data for local development and testing.
// Run with: npm run seed
// WARNING: Do not run this against a production database.

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Wipe existing seed data to allow clean re-seeding.
  await User.deleteMany({});
  await Property.deleteMany({});
  console.log("Existing seed data cleared.");

  // Create the admin account.
  // Passwords are passed as plain text — the User model's pre-save hook
  // handles hashing automatically. Do NOT pre-hash here.
  const admin = await User.create({
    name: "Klinam Admin",
    phone: "+2348000000001",
    password: "Admin@1234",
    role: ROLES.ADMIN,
  });
  console.log(`Admin created — Phone: ${admin.phone} | Password: Admin@1234`);

  // Create a sample caretaker.
  const caretaker = await User.create({
    name: "Success Akporuovo",
    phone: "+2348000000002",
    password: "Caretaker@1234",
    role: ROLES.CARETAKER,
  });
  console.log(`Caretaker created — Phone: ${caretaker.phone} | Password: Caretaker@1234`);

  // Create sample properties for the caretaker.
  await Property.insertMany([
    {
      owner: caretaker._id,
      name: "Success Lodge A",
      description: "A two-storey residential lodge with 8 rooms.",
      locationDescription: "Opposite FUNAAB Gate, beside Mr Biggs, the blue building with a black gate.",
    },
    {
      owner: caretaker._id,
      name: "Success Lodge B",
      description: "A block of flats with 12 units.",
      locationDescription: "Behind Alabata Market, third house after the yellow transformer.",
    },
  ]);
  console.log("Sample properties created.");

  await mongoose.disconnect();
  console.log("Seeding complete. Database connection closed.");
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});