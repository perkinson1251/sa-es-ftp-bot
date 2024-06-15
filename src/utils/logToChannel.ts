import { Client, EmbedBuilder, TextChannel } from "discord.js";
import ServerSettings from "../models/ServerSettings";
import logger from "./logger";

export async function logToChannel(
  client: Client,
  guildId: string,
  message: string
) {
  try {
    const serverSettings = await ServerSettings.findOne({ guildId });

    if (!serverSettings || !serverSettings.ftpLogChannelId) {
      return;
    }

    const logChannel = client.channels.cache.get(
      serverSettings.ftpLogChannelId
    ) as TextChannel;

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor(0x8260d2)
        .setDescription(message)
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    } else {
      logger.warn(
        `Log channel with ID ${serverSettings.ftpLogChannelId} not found.`
      );
    }
  } catch (error) {
    logger.error(`Failed to log message: ${message}`, error);
  }
}
