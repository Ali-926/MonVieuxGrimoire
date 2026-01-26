const express = require("express");
const router = express.Router();

router.post("/signup", (req, res) => {
  res.status(201).json({ message: "Signup route OK" });
});

router.post("/login", (req, res) => {
  res.status(200).json({ message: "Login route OK" });
});

module.exports = router;
