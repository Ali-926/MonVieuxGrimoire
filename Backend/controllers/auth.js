const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Inscription d'un nouvel utilisateur
 * - Hash du mot de passe
 * - Enregistrement en base de données
 */
exports.signup = (req, res) => {
  // Hash du mot de passe avec bcrypt
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Création d'un nouvel utilisateur
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      // Sauvegarde en base
      user
        .save()
        .then(() => res.status(201).json({ message: "User created" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
 * Connexion d'un utilisateur
 * - Vérification de l'email
 * - Vérification du mot de passe
 * - Génération d'un token JWT
 */
exports.login = (req, res) => {
  // Recherche de l'utilisateur par email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Comparaison du mot de passe avec le hash stocké
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Incorrect password" });
          }

          // Génération du JWT
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              { expiresIn: "24h" },
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
