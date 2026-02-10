const multer = require("multer");

/**
 * Configuration du stockage des fichiers avec Multer
 * - Stockage en mémoire (buffer) pour traitement avec Sharp
 */
const storage = multer.memoryStorage();

/**
 * Filtre des fichiers uploadés
 * - Autorise uniquement les formats d'image supportés
 */
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    // Fichier accepté
    cb(null, true);
  } else {
    // Fichier refusé : format non supporté
    cb(new Error("Unsupported file format"), false);
  }
};

/**
 * Export du middleware Multer
 * - Utilisé pour gérer l'upload d'une seule image par requête
 * - Le champ attendu dans le formulaire est "image"
 */
module.exports = multer({
  storage,
  fileFilter,
}).single("image");
