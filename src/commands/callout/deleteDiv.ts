import {
  ActionRowBuilder,
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import Division, { IDivision } from "models/Division";
import isAdmin from "utils/checkAdmin";

export const data = new SlashCommandBuilder()
  .setName("deletedivision")
  .setDescription("Удаляет дивизион");

export async function execute(interaction: CommandInteraction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({
      content: "У вас нет прав для выполнения этой команды.",
      ephemeral: true,
    });
    return;
  }

  const guildId = interaction.guild!.id;
  const divisions = await Division.find({ guildId });

  if (divisions.length === 0) {
    await interaction.reply({
      content: "На этом сервере нет созданных дивизионов.",
      ephemeral: true,
    });
    return;
  }

  const options = divisions.map((division: IDivision) => ({
    label: division.name,
    value: division._id!.toString(),
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("delete-selected-division")
    .setPlaceholder("Выберите дивизион для удаления")
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu
  );

  await interaction.reply({
    content: "Выберите дивизион, который хотите удалить:",
    components: [row],
    ephemeral: true,
  });
}
