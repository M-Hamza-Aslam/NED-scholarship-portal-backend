
const router = require("express").Router();
const {
  getScholarshipList,
  getScholarshipListById,
  getFeaturedScholarshipList,
  getAppliedScholarshipList,
  appliedScholarship
} = require("../controllers/scholarship");

const authenticateToken = require("../middlewares/isAuth");

router.get("/scholarship-list", authenticateToken, getScholarshipList);

router.get("/scholarship-list/:id", authenticateToken, getScholarshipListById);

router.get("/featured-scholarship-list", getFeaturedScholarshipList);

router.get("/applied-scholarship-list", authenticateToken, getAppliedScholarshipList);

router.post("/apply-scholarship", authenticateToken, appliedScholarship);

module.exports = router;