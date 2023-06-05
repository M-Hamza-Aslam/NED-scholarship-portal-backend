const cron = require("node-cron");
const Scholarship = require("../api/models/scholarship");
const dayjs = require("dayjs");

async function runScheduler() {
  try {
    // Schedule the task to run every day at a specific time
    cron.schedule("0 0 * * *", async () => {
      try {
        // Get the current date and time
        const currentDate = dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        //updating status of scholarships
        const result = await Scholarship.updateMany(
          { closeDate: { $lt: currentDate } },
          { $set: { status: "closed" } }
        );
        console.log(result);
      } catch (error) {
        console.error("Error updating scholarship statuses:", error);
      }
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

module.exports = runScheduler;
