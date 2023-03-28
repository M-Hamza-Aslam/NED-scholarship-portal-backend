const router = require("express").Router();
const { login, signUp, protected } = require("../controllers/faculty");

router.post("/login", login);
router.post("/signup", signUp);
router.get("/protected", protected);

module.exports = router;