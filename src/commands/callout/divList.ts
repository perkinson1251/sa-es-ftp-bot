import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Division from "models/Division";
import logger from "utils/logger";

export const data = new SlashCommandBuilder()
  .setName("divisionslist")
  .setDescription("Выводит список всех дивизионов на сервере.");

export async function execute(interaction: CommandInteraction) {
  const guildId = interaction.guild!.id;

  try {
    const divisions = await Division.find({ guildId });
    if (divisions.length === 0) {
      await interaction.reply({
        content: "На этом сервере нет созданных дивизионов.",
        ephemeral: true,
      });
      return;
    }
    let str = "";
    divisions.forEach((division) => {
      const tmp = `Роль: <@&${division.roleId}>\tНазвание: ${division.name}\tЛоготип: ${division.logoUrl || "Не указан"}\n`;
      str += tmp;
    });

    await interaction.reply({
      content: str,
      ephemeral: true,
    });
  } catch (error) {
    logger.error("Failed to fetch divisions: ", error);
    await interaction.reply({
      content: "Произошла ошибка при получении списка дивизионов.",
      ephemeral: true,
    });
  }
}
