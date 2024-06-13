import { config } from "../config";
import { IQueue } from "../interfaces/IQueue";
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
    removedMembers.forEach((member) => {
      logger.info(
        `${type === "trainee" ? "Trainee" : "FTO"} ${member.mention} was removed from the queue when time expired.`
      );
    });
  }

  return newQueue;
};

export default autoRemoveFromQueue;
