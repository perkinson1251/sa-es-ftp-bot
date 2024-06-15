import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  Message,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import QueueChannel from "../models/QueueChannel";
import { generateFtpPanel } from "../utils/generateFtpPanel";
import logger from "../utils/logger";

export const data = new SlashCommandBuilder()
  .setName("ftp")
  .setDescription("Отправляет основную панель бота.");

export async function execute(interaction: CommandInteraction) {
  const guildId = interaction.guild!.id;
  try {
    let queueChannelInfo = await QueueChannel.findOne({ guildId });

    if (queueChannelInfo && queueChannelInfo.channelId) {
      const existingChannel = await interaction.guild!.channels.fetch(
        queueChannelInfo.channelId
      );
      if (existingChannel) {
        const textChannel = existingChannel as TextChannel;
        if (queueChannelInfo.messageId) {
          try {
            const existingMessage = await textChannel.messages.fetch(
              queueChannelInfo.messageId
            );
            if (existingMessage) {
              await existingMessage.delete();
            }
          } catch (error) {
            logger.error(
              "FTP panel, maybe, doesn't exist. Deleting database record. Error: ",
              error
            );
            QueueChannel.deleteOne({ guildId });
          }
        }
      }
    }

    const panel = await generateFtpPanel(guildId);

    const traineeButton = new ButtonBuilder()
      .setCustomId("trainee")
      .setLabel("СТАЖЕР")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("👶");

    const takeButton = new ButtonBuilder()
      .setCustomId("take")
      .setLabel("ВЗЯТЬ")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🤝");

    const ftoButton = new ButtonBuilder()
      .setCustomId("fto")
      .setLabel("ФТО")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🧑");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      traineeButton,
      takeButton,
      ftoButton
    );

    const sentMessage = await interaction.reply({
      embeds: [panel],
      components: [row],
      fetchReply: true,
    });

    if (!queueChannelInfo) {
      queueChannelInfo = new QueueChannel({ guildId });
    }
    queueChannelInfo.channelId = (sentMessage as Message).channel.id;
    queueChannelInfo.messageId = (sentMessage as Message).id;
    await queueChannelInfo.save();
  } catch (error) {
    logger.error("Failed to send or update main panel: ", error);
  }
}

export async function getQueueChannel(guildId: string): Promise<string | null> {
  const queueChannelInfo = await QueueChannel.findOne({ guildId });
  if (!queueChannelInfo || !queueChannelInfo.channelId) {
    return null;
  }
  return queueChannelInfo.channelId;
}
