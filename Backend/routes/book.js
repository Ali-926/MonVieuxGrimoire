const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const bookCtrl = require("../controllers/book");

router.get("/", auth, bookCtrl.getAllBooks);
router.get("/bestrating", auth, bookCtrl.getBestRatedBooks);
router.get("/:id", auth, bookCtrl.getOneBook);

router.post("/", auth, bookCtrl.createBook);
router.put("/:id", auth, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
