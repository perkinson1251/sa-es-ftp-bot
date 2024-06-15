import { config } from "../config";
import { IQueue } from "../interfaces/IQueue";
import Queue from "../models/Queue";
import logger from "./logger";

const autoRemoveFromQueue = async (
  queue: IQueue[],
  type: "trainee" | "fto"
): Promise<IQueue[]> => {
  const now = Math.floor(Date.now() / 1000);
  const newQueue = queue.filter(
    (member) => now - member.timestamp < config.AUTO_REMOVE_TIME * 60
  );

  if (newQueue.length !== queue.length) {
    const removedMembers = queue.filter(
      (member) => now - member.timestamp >= config.AUTO_REMOVE_TIME * 60
    );
    removedMembers.forEach(async (member) => {
      logger.info(
        `${type === "trainee" ? "Trainee" : "FTO"} ${member.mention} was removed from the queue when time expired.`
      );
      try {
        await Queue.deleteOne({ _id: member._id });
      } catch (error) {
        logger.error(`Error deleting ${type} from queue: ${error}`);
      }
    });
  }

  return newQueue;
};

export default autoRemoveFromQueue;
