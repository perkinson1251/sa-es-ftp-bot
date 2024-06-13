import { User } from "discord.js";
import logger from "./logger";

export default async function sendEmbedToUser(user: User, embed: any) {
  try {
    await user.send({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error while DM embed to user ${user.username}:`, error);
  }
}