const jwt = require("jsonwebtoken");

/**
 * Middleware d'authentification
 * - Vérifie la présence et la validité du token JWT
 * - Ajoute l'identité de l'utilisateur à la requête
 */
module.exports = (req, res, next) => {
  try {
    // Récupération du token depuis le header Authorization
    // Format attendu : "Bearer <token>"
    const token = req.headers.authorization.split(" ")[1];

    // Vérification et décodage du token avec la clé secrète
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Ajout de l'ID utilisateur décodé à la requête
    // Cet ID sera utilisé dans les contrôleurs pour les vérifications de droits
    req.auth = { userId: decodedToken.userId };

    // Passage au middleware ou contrôleur suivant
    next();
  } catch (error) {
    // Token manquant, invalide ou expiré
    res.status(401).json({ error });
  }
};
