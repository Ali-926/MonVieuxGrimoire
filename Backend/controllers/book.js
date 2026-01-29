const Book = require("../models/Book");

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
  const book = new Book({
    ...req.body,
    userId: req.auth.userId,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Book created" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.updateBook = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

exports.deleteBook = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

exports.rateBook = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

exports.getBestRatedBooks = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};
