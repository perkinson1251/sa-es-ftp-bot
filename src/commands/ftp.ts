import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import logger from "../utils/logger";
import { panel } from '../utils/panel';

let queueChannel: TextChannel | null = null;

export const data = new SlashCommandBuilder()
  .setName("ftp")
  .setDescription("Отправляет основную панель бота.");

export async function execute(interaction: CommandInteraction) {
  const traineeButton = new ButtonBuilder()
    .setCustomId('trainee')
    .setLabel('СТАЖЕР')
    .setStyle(ButtonStyle.Primary)
    .setEmoji("👶");

  const takeButton = new ButtonBuilder()
    .setCustomId('take')
    .setLabel('ВЗЯТЬ')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🤝");

  const ftoButton = new ButtonBuilder()
    .setCustomId('fto')
    .setLabel('ФТО')
    .setStyle(ButtonStyle.Success)
    .setEmoji("🧑");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(traineeButton, takeButton, ftoButton);
    try {
      queueChannel = interaction.channel as TextChannel;
      await interaction.reply({ embeds: [panel], components: [row], fetchReply: true });
    } catch (error) {
      logger.error("Failed to send main panel: ", error);
    }
}

export function getQueueChannel() {
  return queueChannel;
}