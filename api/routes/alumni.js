const router = require("express").Router();
const {
    login,
    signUp,
    
} = require("../controllers/alumni");

const {
    validateLogin,
    validateSignUp,
} = require("../../util/alumniInputValidation");

router.post("/login", validateLogin, login);
router.post("/signup", validateSignUp, signUp);

module.exports = router;

