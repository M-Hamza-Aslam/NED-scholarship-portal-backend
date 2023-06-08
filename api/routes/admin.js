const router = require("express").Router();

const {
  login,
  signUp,
  getLoginData,
  createMeritScholarship,
  createNeedScholarship,
  uploadScholarshipImg,
  getUserData,
  sendUserProfileImg,
  sendDocument,
  appliedUsersList,
  updateScholarshipStatus,
  updateMeritScholarship,
  updateNeedScholarship,
  deleteScholarship,
  getMarksheet,
  generateReport,
  appliedScholarshipReport,
  getAlumniScholarship,
  getAlumniData,
  sendAlumniProfileImg,
  alumniScholarshipStatus,
} = require("../controllers/admin");

const { body } = require("express-validator");

const authenticateToken = require("../middlewares/isAuth");

const upload = require("../../util/multer");

const {
  validateLogin,
  validateSignUp,
  validateMeritScholarship,
  validateNeedScholarship,
} = require("../../util/adminInputValidation");

router.post("/login", validateLogin, login);

router.post("/signup", validateSignUp, signUp);

router.get("/getLoginData", authenticateToken, getLoginData);

router.post(
  "/create-merit-scholarship",
  authenticateToken,
  validateMeritScholarship,
  createMeritScholarship
);
router.post(
  "/create-need-scholarship",
  authenticateToken,
  validateNeedScholarship,
  createNeedScholarship
);
router.post(
  "/update-merit-scholarship",
  authenticateToken,
  validateMeritScholarship,
  updateMeritScholarship
);
router.post(
  "/update-need-scholarship",
  authenticateToken,
  validateNeedScholarship,
  updateNeedScholarship
);
router.delete("/delete-scholarship", authenticateToken, deleteScholarship);
router.post(
  "/upload-scholarshipImg",
  authenticateToken,
  upload("images/scholarshipImg", [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ]).single("scholarshipImg"),
  uploadScholarshipImg
);

router.get("/user-data", authenticateToken, getUserData);

router.get("/userProfileImg", authenticateToken, sendUserProfileImg);

router.get("/document", authenticateToken, sendDocument);

router.get("/appliedUsersList", authenticateToken, appliedUsersList);

router.post(
  "/update-scholarship-status",
  authenticateToken,
  updateScholarshipStatus
);

router.get("/marksheet", authenticateToken, getMarksheet);
// Generate scholarship report
router.post("/scholarship-report", authenticateToken, generateReport);

// Generate applied scholarship report
router.get(
  "/applied-scholarship-report/:userId",
  authenticateToken,
  appliedScholarshipReport
);

router.get(
  "/created-scholarship-list",
  authenticateToken,
  getAlumniScholarship
);

router.get("/alumni-data", authenticateToken, getAlumniData);
router.get("/alumniProfileImg", authenticateToken, sendAlumniProfileImg);

router.patch(
  "/created-scholarship-status",
  authenticateToken,
  alumniScholarshipStatus
);

module.exports = router;
