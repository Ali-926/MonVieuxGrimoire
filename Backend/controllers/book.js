const Book = require("../models/Book");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

/**
 * Récupération de tous les livres
 */
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Récupération d'un livre par son ID
 */
exports.getOneBook = (req, res) => {
  Book.findById(req.params.id)
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

/**
 * Création d'un nouveau livre
 * - Gestion de l'image avec Sharp
 * - Gestion de la note initiale
 */
exports.createBook = async (req, res) => {
  try {
    // Parser les données envoyées en multipart/form-data
    const bookObject = JSON.parse(req.body.book);

    // Gestion du rating initial (si présent)
    if (bookObject.ratings && bookObject.ratings.length > 0) {
      const initialRating = bookObject.ratings[0];

      // Sécurisation : on force l'ID utilisateur depuis le token
      initialRating.userId = req.auth.userId;

      // Si la note est 0, on ignore complètement la notation
      if (initialRating.grade === 0) {
        bookObject.ratings = [];
        bookObject.averageRating = 0;
      } 
      // Vérification de la validité de la note
      else if (initialRating.grade < 1 || initialRating.grade > 5) {
        return res.status(400).json({
          message: "La note initiale doit être entre 1 et 5",
        });
      } 
      // Calcul de la moyenne pour une première note valide
      else {
        bookObject.averageRating = initialRating.grade;
      }
    } else {
      // Aucun rating fourni
      bookObject.ratings = [];
      bookObject.averageRating = 0;
    }

    // Générer un nom de fichier unique pour l'image
    const filename = `${Date.now()}-${bookObject.title
      .replace(/\s+/g, "_")
      .toLowerCase()}.webp`;

    const outputPath = path.join("images", filename);

    // Optimisation de l'image avec Sharp
    await sharp(req.file.buffer)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Création du document Book
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${filename}`,
    });

    await book.save();
    res.status(201).json({ message: "Book created" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

/**
 * Mise à jour d'un livre existant
 * - Gestion optionnelle du remplacement de l'image
 */
exports.updateBook = async (req, res) => {
  try {
    let bookObject;

    if (req.file) {
      // Récupération du livre existant
      const book = await Book.findById(req.params.id);

      // Suppression de l'ancienne image du serveur
      const oldFilename = book.imageUrl.split("/images/")[1];
      fs.unlink(path.join("images", oldFilename), (err) => {
        if (err) console.log(err);
      });

      // Parser les nouvelles données du livre
      bookObject = JSON.parse(req.body.book);

      // Générer un nouveau nom de fichier pour la nouvelle image
      const filename = `${Date.now()}-${bookObject.title
        .replace(/\s+/g, "_")
        .toLowerCase()}.webp`;

      const outputPath = path.join("images", filename);

      // Optimisation de la nouvelle image
      await sharp(req.file.buffer)
        .resize({ width: 800 })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Mise à jour de l'URL de l'image
      bookObject.imageUrl = `${req.protocol}://${req.get(
        "host",
      )}/images/${filename}`;
    } else {
      // Aucune nouvelle image : on met à jour uniquement les champs texte
      bookObject = { ...req.body };
    }

    // Mise à jour du document en base
    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id },
    );

    res.status(200).json({ message: "Book updated" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

/**
 * Suppression d'un livre
 * - Vérification de l'autorisation
 * - Suppression de l'image associée
 */
exports.deleteBook = (req, res) => {
  Book.findById(req.params.id)
    .then((book) => {
      // Vérification que l'utilisateur est bien le propriétaire du livre
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Unauthorized request" });
      }

      // Suppression de l'image du serveur
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        // Suppression du document en base
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Book deleted" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
};

/**
 * Ajout d'une note à un livre
 * - Un utilisateur ne peut noter qu'une seule fois
 */
exports.rateBook = (req, res) => {
  const userId = req.auth.userId;
  const grade = req.body.rating;

  // Vérification de la validité de la note
  if (grade < 1 || grade > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Vérifier si l'utilisateur a déjà noté ce livre
      const alreadyRated = book.ratings.find(
        (rating) => rating.userId === userId && rating.grade !== 0,
      );

      if (alreadyRated) {
        return res.status(400).json({
          message: "User already rated this book",
        });
      }

      // Suppression d'une éventuelle note temporaire à 0
      book.ratings = book.ratings.filter(
        (r) => !(r.userId === userId && r.grade === 0),
      );

      // Ajout de la nouvelle note
      book.ratings.push({ userId, grade });

      // Recalcul de la moyenne
      const sumRatings = book.ratings.reduce(
        (sum, rating) => sum + rating.grade,
        0,
      );
      book.averageRating =
        book.ratings.length > 0 ? sumRatings / book.ratings.length : 0;

      book
        .save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
 * Récupération des 3 livres les mieux notés
 */
exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
