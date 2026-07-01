// List every environment variable the app depends on.
// validateEnv() is called once at startup — if anything is missing,
// the process exits with a clear message before the server binds to a port.
const REQUIRED_VARS = [
  "NODE_ENV",
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  /* "OPAY_PUBLIC_KEY",
  "OPAY_SECRET_KEY",
  "OPAY_MERCHANT_ID",
  "OPAY_BASE_URL",
  "OPAY_WEBHOOK_SECRET", */
  "CLIENT_URL",
];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

module.exports = validateEnv;