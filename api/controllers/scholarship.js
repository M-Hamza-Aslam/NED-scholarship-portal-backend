const Scholarship = require("../modules/scholarship");

const url = require("url");

module.exports = {
  getScholarshipList: async (req, res) => {
    try {
      const scholarships = await Scholarship.find();
      res.json(scholarships);
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong with the api",
        error: error.message,
      });
    }
  },
  getScholarshipListById: async (req, res) => {
    try {
      const id = req.params.id; //To seprate the id from the parameter

      const scholarship = await Scholarship.findById(id);
      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found",
        });
      }

      res.json(scholarship);
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong with the api",
        error: error.message,
      });
    }
  },
  getFeaturedScholarshipList: async (req, res) => {
    try {
      // Parse the URL using the Node.js built-in url module.
      const urlObj = url.parse(req.url, true);

      // Extracting the qty query parameter from the urlObj object.
      const qty = urlObj.query.qty;

      // Converting the qty parameter to a number.
      const qtyNum = parseInt(qty);

      // Fetching the top ten scholarship lists from your MongoDB database.
      const topScholarships = await Scholarship.find()
        .sort({ popularity: -1 })
        .limit(qtyNum);

      res.json(topScholarships);
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong with the api",
        error: error.message,
      });
    }
  },
};
