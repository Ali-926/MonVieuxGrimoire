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
  res.status(501).json({ message: "Not implemented yet" });
};

exports.getBestRatedBooks = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};
