import { commands } from "commands";
import { config } from "config";
import { connectDB } from "database";
import { deployCommands } from "deploy-commands";
import { Client, GatewayIntentBits } from "discord.js";
import { handleSubmitCalloutForm } from "handlers/callout/calloutHandler";
import { handleDeleteDivisionSelectMenuInteraction } from "handlers/divisions/deleteDivisionHandler";
import { handleSelectDivisionForCallout } from "handlers/divisions/selectDivisionForCallotHandler";
import { handleFtpButtons } from "handlers/ftp/ftpButtonsHandler";
import logger from "utils/logger";
import { updateQueues } from "utils/updateQueues";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", async () => {
  logger.info(`${client.user?.username} is online.`);
  await connectDB();
  const guilds = await client.guilds.fetch();
  guilds.forEach(async (guild) => {
    logger.info(`Deploying commands for guild: ${guild.id}`);
    await deployCommands({ guildId: guild.id });
  });
  setInterval(async () => {
    try {
      await updateQueues(client);
    } catch (error) {
      logger.error("Failed to update queues:", error);
    }
  }, 60 * 1000);
});

client.on("guildCreate", async (guild) => {
  logger.info(`Bot added to guild: ${guild.id}`);
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;
    logger.info(`Received command: ${commandName}`);
    const command = commands[commandName as keyof typeof commands];

    if (command) {
      try {
        logger.info(`Executing command: ${commandName}`);
        await command.execute(interaction);
        logger.info(`Command executed: ${commandName}`);
      } catch (error) {
        logger.error(`Error executing ${commandName}:`, error);
        await interaction.reply({
          content: "Что-то пошло не так...",
          ephemeral: true,
        });
      }
    } else {
      logger.error(`Command not found: ${commandName}`);
    }
  }
  if (interaction.isButton()) {
    const customId = interaction.customId;
    try {
      await handleFtpButtons(interaction);
      await updateQueues(client);
    } catch (error) {
      logger.error(`Error handling button interaction ${customId}:`, error);
      await interaction.reply({
        content: "Что-то пошло не так...",
        ephemeral: true,
      });
    }
  }
  if (interaction.isStringSelectMenu()) {
    const customId = interaction.customId;
    try {
      switch (customId) {
        case "delete-selected-division":
          await handleDeleteDivisionSelectMenuInteraction(interaction);
          break;
        case "select-division-for-callout":
          await handleSelectDivisionForCallout(interaction);
          break;
        default:
          logger.info(`Unhandled select menu: ${customId}`);
      }
    } catch (error) {
      logger.error(
        `Error handling select menu interaction ${customId}:`,
        error
      );
      await interaction.reply({
        content: "Что-то пошло не так...",
        ephemeral: true,
      });
    }
  }
  if (interaction.isModalSubmit()) {
    const customId = interaction.customId;
    try {
      switch (customId) {
        case "calloutInfoModal":
          await handleSubmitCalloutForm(interaction);
          break;
        default:
          logger.info(`Unhandled modal submit: ${customId}`);
      }
    } catch (error) {
      logger.error(
        `Error handling modal submit interaction ${customId}:`,
        error
      );
      await interaction.reply({
        content: "Что-то пошло не так...",
        ephemeral: true,
      });
    }
  }
});

client.login(config.DISCORD_TOKEN);
