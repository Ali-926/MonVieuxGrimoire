const Book = require("../models/Book");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res) => {
  Book.findById(req.params.id)
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);

    // Gestion du rating initial
    if (bookObject.ratings && bookObject.ratings.length > 0) {
      const initialRating = bookObject.ratings[0];
      initialRating.userId = req.auth.userId; // Force le userId pour sécurité

      if (initialRating.grade === 0) {
        bookObject.ratings = [];
        bookObject.averageRating = 0;
      } else if (initialRating.grade < 1 || initialRating.grade > 5) {
        return res.status(400).json({ message: "La note initiale doit être entre 1 et 5" });
      } else {
        bookObject.averageRating = initialRating.grade;
      }
    } else {
      bookObject.ratings = [];
      bookObject.averageRating = 0;
    }

    // Générer un nom de fichier unique
    const filename = `${Date.now()}-${bookObject.title
      .replace(/\s+/g, "_")
      .toLowerCase()}.webp`;

    const outputPath = path.join("images", filename);

    // Optimisation avec Sharp
    await sharp(req.file.buffer)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(outputPath);

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

exports.updateBook = async (req, res) => {
  try {
    let bookObject;

    if (req.file) {
      // Récupérer le livre existant
      const book = await Book.findById(req.params.id);

      // Supprimer l'ancienne image
      const oldFilename = book.imageUrl.split("/images/")[1];
      fs.unlink(path.join("images", oldFilename), (err) => {
        if (err) console.log(err);
      });

      // Parser les données
      bookObject = JSON.parse(req.body.book);

      // Générer un nouveau nom de fichier
      const filename = `${Date.now()}-${bookObject.title
        .replace(/\s+/g, "_")
        .toLowerCase()}.webp`;

      const outputPath = path.join("images", filename);

      // Optimiser la nouvelle image
      await sharp(req.file.buffer)
        .resize({ width: 800 })
        .webp({ quality: 80 })
        .toFile(outputPath);

      bookObject.imageUrl = `${req.protocol}://${req.get(
        "host",
      )}/images/${filename}`;
    } else {
      // Pas de nouvelle image
      bookObject = { ...req.body };
    }

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id },
    );

    res.status(200).json({ message: "Book updated" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteBook = (req, res) => {
  Book.findById(req.params.id)
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Unauthorized request" });
      }

      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Book deleted" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.rateBook = (req, res) => {
  const userId = req.auth.userId;
  const grade = req.body.rating;

  if (grade < 1 || grade > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const alreadyRated = book.ratings.find(
        (rating) => rating.userId === userId && rating.grade !== 0 
      );

      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "User already rated this book" });
      }

      book.ratings = book.ratings.filter(r => !(r.userId === userId && r.grade === 0));

      book.ratings.push({ userId, grade });

      const sumRatings = book.ratings.reduce(
        (sum, rating) => sum + rating.grade,
        0,
      );
      book.averageRating = book.ratings.length > 0 ? sumRatings / book.ratings.length : 0;

      book
        .save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
