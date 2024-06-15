import { connectDB } from "database";
import { ButtonInteraction, Client, GatewayIntentBits } from "discord.js";
import ServerSettings from "models/ServerSettings";
import { logToChannel } from "utils/logToChannel";
import sendEmbedToUser from "utils/sendEmbed";
import { updateQueues } from "utils/updateQueues";
import { commands } from "./commands";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";
import Queue from "./models/Queue";
import logger from "./utils/logger";

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
    logger.info(`Button pressed: ${customId}`);
    try {
      switch (customId) {
        case "trainee":
          await handleTraineeButton(interaction);
          break;
        case "take":
          await handleTakeButton(interaction);
          break;
        case "fto":
          await handleFtoButton(interaction);
          break;
        default:
          logger.info(`Unhandled button: ${customId}`);
      }
      await updateQueues(client);
    } catch (error) {
      logger.error(`Error handling button interaction ${customId}:`, error);
      await interaction.reply({
        content: "Что-то пошло не так...",
        ephemeral: true,
      });
    }
  }
});

async function handleTraineeButton(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild?.id;
  const mention = `<@${userId}>`;
  const timestamp = Math.floor(Date.now() / 1000);

  const ftpLoggingChannelId = ServerSettings.findOne({ guildId });

  const existingEntry = await Queue.findOne({
    guildId,
    userId,
    type: "trainee",
  });

  if (!existingEntry) {
    await Queue.create({
      guildId,
      userId,
      mention,
      timestamp,
      type: "trainee",
    });
    await interaction.reply({
      content: `Вы встали в очередь как стажер.`,
      ephemeral: true,
    });
    logger.info(`Trainee ${userId} in guild ${guildId} added to queue.`);
    await logToChannel(
      interaction.client,
      guildId!,
      `Стажёр <@${userId}> встал в очередь стажёров.`
    );
  } else {
    await Queue.deleteOne({ guildId, userId, type: "trainee" });
    await interaction.reply({
      content: `Вы вышли из очереди.`,
      ephemeral: true,
    });
    logger.info(`Trainee ${userId} in guild ${guildId} left the queue.`);
    await logToChannel(
      interaction.client,
      guildId!,
      `Стажёр <@${userId}> самостоятельно вышел из очереди.`
    );
  }
}

async function handleTakeButton(interaction: ButtonInteraction) {
  const guildId = interaction.guild?.id;
  const ftoUserId = interaction.user.id;
  const ftoMention = `<@${ftoUserId}>`;

  await Queue.deleteOne({ guildId, userId: ftoUserId, type: "fto" });
  const trainee = await Queue.findOne({ guildId, type: "trainee" }).sort({
    timestamp: 1,
  });
  if (ftoUserId === trainee?.userId) {
    await interaction.reply({
      content: "Вы не можете взять сами себя.",
      ephemeral: true,
    });
    return;
  }

  if (!trainee) {
    await interaction.reply({
      content: "Очередь стажеров пуста.",
      ephemeral: true,
    });
    return;
  }

  await Queue.deleteOne({ guildId, userId: trainee.userId, type: "trainee" });
  logger.info(
    `FTO ${ftoUserId} in guild ${guildId} took an trainee ${trainee.id}.`
  );
  await logToChannel(
    interaction.client,
    guildId!,
    `FTO ${ftoMention} взял из очереди стажёра ${trainee.mention}.`
  );
  const guild = interaction.guild!;
  const guildAvatarURL = guild.iconURL() || undefined;
  const embed = {
    color: 0x8260d2,
    author: {
      name: "Developed by perkinson for SA-ES",
      iconURL: "https://gambit-rp.ru/assets/static/images/logotypeDrag.png",
      url: "https://github.com/perkinson1251",
    },
    title: `Вы были взяты наставником`,
    description: `${ftoMention} вас взял в качестве своего напарника. Свяжитесь с вашим новым наставником.`,
    timestamp: new Date().toISOString(),
    footer: {
      text: `Оповещение, ${guild.name}`,
    },
    thumbnail: {
      url: guildAvatarURL ?? "",
    },
  };
  const traineeMember = await guild.members.fetch(trainee.userId);
  // @ts-expect-error: Temporary workaround until correct type for embed is resolved
  await sendEmbedToUser(traineeMember.user, embed);
}

async function handleFtoButton(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild?.id;
  const mention = `<@${userId}>`;
  const timestamp = Math.floor(Date.now() / 1000);

  const existingEntry = await Queue.findOne({ guildId, userId, type: "fto" });

  if (!existingEntry) {
    await Queue.create({ guildId, userId, mention, timestamp, type: "fto" });
    await interaction.reply({
      content: `Вы встали в очередь как наставник.`,
      ephemeral: true,
    });
    logger.info(`FTO ${userId} in guild ${guildId} added to queue.`);
    await logToChannel(
      interaction.client,
      guildId!,
      `FTO <@${userId}> встал в очередь наставников.`
    );
  } else {
    await Queue.deleteOne({ guildId, userId, type: "fto" });
    await interaction.reply({
      content: `Вы вышли из очереди.`,
      ephemeral: true,
    });
    logger.info(`FTO ${userId} in guild ${guildId} left the queue.`);
    await logToChannel(
      interaction.client,
      guildId!,
      `FTO <@${userId}> самостоятельно вышел из очереди.`
    );
  }
}

client.login(config.DISCORD_TOKEN);
