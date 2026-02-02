const Book = require("../models/Book");
const fs = require("fs");

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

exports.createBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Book created" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.updateBook = (req, res) => {
  Book.findById(req.params.id)
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Unauthorized request" });
      }

      let bookObject = {};

      if (req.file) {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {});

        bookObject = {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        };
      } else {
        bookObject = { ...req.body };
      }

      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id },
      )
        .then(() => res.status(200).json({ message: "Book updated" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
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

  if (grade < 0 || grade > 5) {
    return res.status(400).json({ message: "Rating must be between 0 and 5" });
  }

  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const alreadyRated = book.ratings.find(
        (rating) => rating.userId === userId,
      );

      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "User already rated this book" });
      }

      book.ratings.push({ userId, grade });

      const sumRatings = book.ratings.reduce(
        (sum, rating) => sum + rating.grade,
        0,
      );
      book.averageRating = sumRatings / book.ratings.length;

      book
        .save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};
