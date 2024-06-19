import { StringSelectMenuInteraction } from "discord.js";
import Division from "models/Division";
import logger from "utils/logger";

export async function handleDeleteDivisionSelectMenuInteraction(
  interaction: StringSelectMenuInteraction
) {
  if (interaction.customId === "delete-selected-division") {
    const selectedDivisionId = interaction.values[0];
    const guildId = interaction.guild!.id;

    try {
      const division = await Division.findOneAndDelete({
        _id: selectedDivisionId,
        guildId,
      });

      if (!division) {
        await interaction.reply({
          content: "Дивизион не найден или уже был удален.",
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: `Дивизион **${division.name}** успешно удален.`,
        ephemeral: true,
      });

      logger.info(
        `Division deleted: ${division.name} (Role: ${division.roleId}, Guild: ${guildId})`
      );
    } catch (error) {
      logger.error("Failed to delete division: ", error);
      await interaction.reply({
        content: "Произошла ошибка при удалении дивизиона.",
        ephemeral: true,
      });
    }
  }
}
