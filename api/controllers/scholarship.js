
const {validationResult } = require("express-validator");

const Scholarship = require("../modules/scholarship");
const url = require('url');


module.exports = {
  getScholarshipList: async(req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      
      const scholarshipList = await Scholarship.find();

      // Modifying the date format
      const scholarshipData = scholarshipList.map(scholarship => {
        return {
          ...scholarship.toObject(),
          date: (() => {
            const date = new Date(scholarship.date);
            const month = date.toLocaleString('default', { month: 'long' });
            const day = date.getDate();
            const year = date.getFullYear();
            return { month, day, year };
          })(),
        };
      });

      console.log(scholarshipData);
      res.json(scholarshipData);

    } catch (error) {
      res.status(500).json({
        message: "Something went wrong with the api",
        error: error.message,
      });
    }
  },
  getScholarshipListById: async(req,res) => {
    try{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const id = req.params.id; //To seprate the id from the parameter

      const foundScholarship = await Scholarship.findById(id);
      if (!foundScholarship) {
        return res.status(404).json({ 
          message: "Scholarship not found" 
        });
      }

       // Modifying the date format
       const scholarshipData = {
        ...foundScholarship.toObject(),
        date: (() => {
          const date = new Date(foundScholarship.date);
          const month = date.toLocaleString('default', { month: 'long' });
          const day = date.getDate();
          const year = date.getFullYear();
          return { month, day, year };
        })(),
      };

      console.log(scholarshipData);
      res.json(scholarshipData);

    } catch (error) {
      res.status(500).json({
        message: "Something went wrong with the api",
        error: error.message,
      });
    }
  },
  getFeaturedScholarshipList: async(req,res) => {
    try{

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

       // Modifying the date format
       const scholarshipData = topScholarships.map(scholarship => {
        return {
          ...scholarship.toObject(),
          date: (() => {
            const date = new Date(scholarship.date);
            const month = date.toLocaleString('default', { month: 'long' });
            const day = date.getDate();
            const year = date.getFullYear();
            return { month, day, year };
          })(),
        };
      });

      console.log(scholarshipData);
      res.json(scholarshipData);


    } catch (error) {
      res.status(500).json({
        message: "Something went wrong with the api",
        error: error.message,
      });
    }
  }
};
