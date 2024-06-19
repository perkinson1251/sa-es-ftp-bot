import { CommandInteraction, Role, SlashCommandBuilder } from "discord.js";
import Division from "models/Division";
import isAdmin from "utils/checkAdmin";
import logger from "utils/logger";

export const data = new SlashCommandBuilder()
  .setName("createdivision")
  .setDescription("Создаёт дивизион для использования /callout")
  .addRoleOption((option) =>
    option
      .setName("role")
      .setDescription("Выберите роль, которая будет упоминаться")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Введите название дивизиона")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("logo")
      .setDescription("Введите ссылку на логотип (опционально)")
  );

export async function execute(interaction: CommandInteraction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({
      content: "У вас нет прав для выполнения этой команды.",
      ephemeral: true,
    });
    return;
  }

  const guildId = interaction.guild!.id;
  const role = interaction.options.get("role", true).role as Role;
  const name = interaction.options.get("name", true).value as string;
  const logoUrl = interaction.options.get("logo")?.value as string | undefined;

  try {
    const existingDivision = await Division.findOne({
      guildId,
      roleId: role.id,
    });
    if (existingDivision) {
      await interaction.reply({
        content: "Дивизион с этой ролью уже существует.",
        ephemeral: true,
      });
      return;
    }
    const division = new Division({
      guildId,
      roleId: role.id,
      name,
      logoUrl,
    });
    await division.save();
    await interaction.reply({
      content: `Дивизион **${name}** успешно создан.`,
      ephemeral: true,
    });
    logger.info(
      `Division created: ${name} (Role: ${role.name}, Guild: ${guildId})`
    );
  } catch (error) {
    logger.error("Failed to create division: ", error);
    await interaction.reply({
      content: "Произошла ошибка при создании дивизиона.",
      ephemeral: true,
    });
  }
}
