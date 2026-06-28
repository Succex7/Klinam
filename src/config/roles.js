// Centralised role definitions. Import this anywhere you need to reference
// a role — avoids magic strings scattered across the codebase.
const ROLES = Object.freeze({
  CARETAKER: "caretaker",
  ADMIN: "admin",
});

module.exports = ROLES;