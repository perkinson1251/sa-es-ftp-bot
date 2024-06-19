import {
  ChannelType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import ServerSettings from "models/ServerSettings";
import isAdmin from "utils/checkAdmin";
import logger from "utils/logger";

export const data = new SlashCommandBuilder()
  .setName("ftplogchannel")
  .setDescription("Настройка канала логирования.")
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription(
        'Выберите канал для логирования или "off" для отключения логирования'
      )
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("option")
      .setDescription("True для отключения логирования")
      .setRequired(false)
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
  const options = interaction.options as CommandInteractionOptionResolver;
  const channelOption = options.getChannel("channel", false);
  const offOption = options.getBoolean("option", false);

  try {
    let serverSettings = await ServerSettings.findOne({ guildId });

    if (offOption) {
      if (serverSettings && serverSettings.ftpLogChannelId) {
        serverSettings.ftpLogChannelId = undefined;
        await serverSettings.save();
        logger.info(`Logging disabled for guild: ${guildId}`);
        await interaction.reply("Логирование отключено.");
      } else {
        await interaction.reply("Логирование уже отключено.");
      }
    } else {
      if (!channelOption || !(channelOption instanceof TextChannel)) {
        await interaction.reply("Указан неверный канал.");
        return;
      }

      const channelId = channelOption.id;

      if (!serverSettings) {
        serverSettings = new ServerSettings({
          guildId,
          ftpLogChannelId: channelId,
        });
      } else {
        serverSettings.ftpLogChannelId = channelId;
      }

      await serverSettings.save();
      logger.info(`Log channel set to ${channelId} for guild: ${guildId}`);
      await interaction.reply(
        `Канал логирования установлен на <#${channelId}>.`
      );
    }
  } catch (error) {
    logger.error("Failed to set log channel: ", error);
    await interaction.reply("Ошибка при настройке канала логирования.");
  }
}
