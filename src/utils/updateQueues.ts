import { Client, TextChannel } from "discord.js";
import { getQueueChannel } from "../commands/ftp";
import Queue from "../models/Queue";
import autoRemoveFromQueue from "./autoRemoveFromQueue";
import logger from "./logger";
import updateQueueMessage from "./updateQueueMessage";

export async function updateQueues(client: Client) {
  try {
    const guilds = client.guilds.cache;
    for (const guild of guilds.values()) {
      const traineeQueue = await Queue.find({
        guildId: guild.id,
        type: "trainee",
      });
      const ftoQueue = await Queue.find({ guildId: guild.id, type: "fto" });

      const channelID = await getQueueChannel(guild.id);
      if (!channelID) {
        logger.warn(
          `Queue channel is null for guild ${guild.id}, cannot update queue message.`
        );
        continue;
      }

      const channel = await guild.channels.fetch(channelID);
      if (channel) {
        const updatedTraineeQueue = await autoRemoveFromQueue(
          traineeQueue,
          "trainee"
        );
        const updatedFtoQueue = await autoRemoveFromQueue(ftoQueue, "fto");
        await updateQueueMessage(
          channel as TextChannel,
          updatedTraineeQueue,
          updatedFtoQueue,
          client.user?.id ?? ""
        );
      } else {
        logger.warn(
          `Queue channel (${channelID}) is not a valid text channel for guild ${guild.id}, cannot update queue message.`
        );
      }
    }
  } catch (error) {
    logger.error("Error updating queues:", error);
  }
}
