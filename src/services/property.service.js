const Property = require("../models/Property.model");

/**
 * Create a new property for the authenticated caretaker.
 *
 * @param {string} ownerId - The caretaker's user ID
 * @param {object} data - { name, description, locationDescription }
 * @returns {object} The created property document
 */
const createProperty = async (ownerId, data) => {
  const { name, description, locationDescription } = data;

  // The compound unique index on (owner, name) handles duplicates at the DB
  // level, but we check here to return a friendlier error message.
  const existingProperty = await Property.findOne({ owner: ownerId, name });
  if (existingProperty) {
    const error = new Error(
      `You already have a property named "${name}". Please use a different name.`
    );
    error.statusCode = 409;
    throw error;
  }

  const property = await Property.create({
    owner: ownerId,
    name,
    description,
    locationDescription,
  });

  return property;
};

/**
 * Get all properties belonging to the authenticated caretaker.
 *
 * @param {string} ownerId - The caretaker's user ID
 * @returns {object[]} Array of property documents
 */
const getMyProperties = async (ownerId) => {
  const properties = await Property.find({ owner: ownerId, isActive: true }).sort({
    createdAt: -1,
  });

  return properties;
};

/**
 * Get a single property by ID. Enforces ownership so a caretaker
 * cannot access another caretaker's property.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} ownerId - The requesting user's ID
 * @param {string} role - The requesting user's role
 * @returns {object} The property document
 */
const getPropertyById = async (propertyId, ownerId, role) => {
  const property = await Property.findById(propertyId).populate(
    "owner",
    "name phone"
  );

  if (!property || !property.isActive) {
    const error = new Error("Property not found.");
    error.statusCode = 404;
    throw error;
  }

  // Admins can view any property. Caretakers can only view their own.
  const isOwner = property.owner._id.toString() === ownerId.toString();
  if (role !== "admin" && !isOwner) {
    const error = new Error("You do not have permission to view this property.");
    error.statusCode = 403;
    throw error;
  }

  return property;
};

/**
 * Update a property's name, description, or location.
 * Bin status is not updated here — that goes through the collection service.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} ownerId - The caretaker's user ID
 * @param {object} data - Fields to update
 * @returns {object} The updated property document
 */
const updateProperty = async (propertyId, ownerId, data) => {
  const property = await Property.findOne({ _id: propertyId, owner: ownerId });

  if (!property || !property.isActive) {
    const error = new Error("Property not found.");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = ["name", "description", "locationDescription"];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      property[field] = data[field];
    }
  });

  await property.save();

  return property;
};

/**
 * Soft-delete a property by marking it as inactive.
 * Hard deletes are avoided to preserve payment and collection history.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} ownerId - The caretaker's user ID
 */
const deleteProperty = async (propertyId, ownerId) => {
  const property = await Property.findOne({ _id: propertyId, owner: ownerId });

  if (!property || !property.isActive) {
    const error = new Error("Property not found.");
    error.statusCode = 404;
    throw error;
  }

  property.isActive = false;
  await property.save();
};

module.exports = {
  createProperty,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};