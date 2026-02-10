const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

/**
 * Schéma utilisateur
 * - Utilisé pour l'authentification et l'autorisation
 */
const userSchema = mongoose.Schema({
  // Adresse email de l'utilisateur
  // Utilisée comme identifiant unique
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // Mot de passe hashé avec bcrypt
  password: {
    type: String,
    required: true,
  },
});

// Plugin permettant de garantir l'unicité de l'email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
