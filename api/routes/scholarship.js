
const router = require("express").Router();
const {
  getScholarshipList,
  getScholarshipListById,
  getFeaturedScholarshipList,
} = require("../controllers/scholarship");

const authenticateToken = require("../middlewares/isAuth");

router.get("/scholarship-list", authenticateToken, getScholarshipList);

router.get("/scholarship-list/:id", authenticateToken, getScholarshipListById);

router.get("/featured-scholarship-list", getFeaturedScholarshipList);

module.exports = router;
