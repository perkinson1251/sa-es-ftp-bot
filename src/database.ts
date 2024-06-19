import mongoose from "mongoose";
import { config } from "./config";
import logger from "./utils/logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.DB_URI!, {
      autoCreate: true,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(`Error while connecting MongoDB: ${err}`);
    process.exit(1);
  }
};
