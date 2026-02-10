const mongoose = require("mongoose");

/**
 * Schéma des notations
 * - Représente une note donnée par un utilisateur
 * - Chaque utilisateur ne peut noter qu'une seule fois un livre
 */
const ratingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  grade: { type: Number, required: true, min: 0, max: 5 },
});

/**
 * Schéma principal du livre
 * - Représente un ouvrage publié sur la plateforme
 */
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 },
});

module.exports = mongoose.model("Book", bookSchema);
