require('dotenv').config();
const mongoose = require("mongoose");
const logger = require("./logger");

module.exports = {
  init: async () => {
    mongoose.Promise = global.Promise;

    mongoose.connection.on("error", (err) => {
      logger.error(`Mongoose connection error: ${err.stack}`, {
        label: "Database",
      });
    });

    mongoose.connection.on("disconnected", () => {
      logger.error(`Mongoose connection lost`, { label: "Database" });
    });

    mongoose.connection.on("connected", () => {
      logger.info(`Mongoose connection connected`, { label: "Database" });
    });

    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false); // Set to false for compatibility with modern MongoDB drivers.
    mongoose.set("useCreateIndex", true);
    mongoose.set("useUnifiedTopology", true); // Recommended for modern MongoDB versions.

    try {
      await mongoose.connect(process.env.MONGO);
      logger.info("Mongoose connected to MongoDB", { label: "Database" });
      return true;
    } catch (error) {
      logger.error(`Mongoose connection error: ${error.message}`, { label: "Database" });
      process.exit(1);
    }
  },
};
