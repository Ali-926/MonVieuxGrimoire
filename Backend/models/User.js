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

  // Mot de passe chiffré de l'utilisateur
  password: {
    type: String,
    required: true,
  },
});

// Plugin améliorant la gestion des erreurs de validation d'unicité
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
