import {
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import Division, { IDivision } from "models/Division";
import logger from "utils/logger";

export const data = new SlashCommandBuilder()
  .setName("callout")
  .setDescription("Создает каллаут.");

export async function execute(interaction: CommandInteraction) {
  try {
    const guildId = interaction.guild!.id;
    const divisions = await Division.find({ guildId });

    const options = divisions.map((division: IDivision) => ({
      label: division.name,
      value: division._id!.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select-division-for-callout")
      .setPlaceholder("Выберите дивизион для запроса")
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    );

    const embed = new EmbedBuilder()
      .setColor(0x8260d2)
      .setTitle("ИНЦИДЕНТ")
      .setAuthor({
        name: "CALLOUT",
      })
      .setDescription("Выберите отдел который Вы хотите запросить.");

    await interaction.reply({
      content: "Выберите дивизион, который хотите запросить:",
      components: [row],
      embeds: [embed],
      ephemeral: true,
    });
  } catch (error) {
    logger.error("Failed to execute /callout command:", error);
    await interaction.reply({
      content: "Произошла ошибка при выполнении команды.",
      ephemeral: true,
    });
  }
}
