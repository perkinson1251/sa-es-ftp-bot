import { ButtonInteraction, Client, GatewayIntentBits, TextChannel } from "discord.js";
import sendEmbedToUser from "utils/sendEmbed";
import { commands } from "./commands";
import { getQueueChannel } from "./commands/ftp";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";
import { IQueue } from "./interfaces/IQueue";
import autoRemoveFromQueue from "./utils/autoRemoveFromQueue";
import logger from "./utils/logger";
import updateQueueMessage from "./utils/updateQueueMessage";

let traineeQueue: IQueue[] = [];
let ftoQueue: IQueue[] = [];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
});

client.once("ready", async () => {
  logger.info(`${client.user?.username} is online.`);
  const guilds = await client.guilds.fetch();
  logger.info(`Bot is in ${guilds.size} guild(s).`);
  guilds.forEach(async (guild) => {
    logger.info(`Deploying commands for guild: ${guild.id}`);
    await deployCommands({ guildId: guild.id });
  });
  setInterval(async () => {
    traineeQueue = await autoRemoveFromQueue(traineeQueue, "trainee");
    ftoQueue = await autoRemoveFromQueue(ftoQueue, "fto");
    const channel = getQueueChannel();
    await updateQueueMessage(channel as TextChannel, traineeQueue, ftoQueue, client.user?.id!);
    // await updateQueueMessage(client.channels.cache.get(id) as TextChannel, traineeQueue, ftoQueue, client.user?.id!); 
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
        await interaction.reply({ content: "Что-то пошло не так...", ephemeral: true });
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
        case 'trainee':
          await handleTraineeButton(interaction);
          traineeQueue = await autoRemoveFromQueue(traineeQueue, "trainee");
          break;
        case 'take':
          await handleTakeButton(interaction);
          traineeQueue = await autoRemoveFromQueue(traineeQueue, "trainee");
          ftoQueue = await autoRemoveFromQueue(ftoQueue, "fto");
          break;
        case 'fto':
          await handleFtoButton(interaction);
          ftoQueue = await autoRemoveFromQueue(ftoQueue, "fto");
          break;
        default:
          logger.info(`Unhandled button: ${customId}`);
      }
      await updateQueueMessage(interaction.channel as TextChannel, traineeQueue, ftoQueue, client.user?.id!); 
    } catch (error) {
      logger.error(`Error handling button interaction ${customId}:`, error);
      await interaction.reply({ content: "Что-то пошло не так...", ephemeral: true });
    }
  }
});

async function handleTraineeButton(interaction: ButtonInteraction) {
  logger.info("trainee button pressed");
  const userId = interaction.user.id;
  const mention = `<@${userId}>`;
  const timestamp = Math.floor(Date.now() / 1000);
  const traineeIndex = traineeQueue.findIndex(t => t.id === userId);
  if (traineeIndex === -1) {
    traineeQueue.push({ id: userId, mention, timestamp });
    await interaction.reply({ content: `Вы встали в очередь как стажер.`, ephemeral: true });
  } else {
    traineeQueue.splice(traineeIndex, 1);
    await interaction.reply({ content: `Вы вышли из очереди.`, ephemeral: true });
  }
  await updateQueueMessage(interaction.channel as TextChannel, traineeQueue, ftoQueue, client.user?.id!);
}

async function handleTakeButton(interaction: ButtonInteraction) {
  logger.info("take button pressed");
  const ftoUserId = interaction.user.id;
  const ftoMention = `<@${ftoUserId}>`;
  const ftoIndex = ftoQueue.findIndex(t => t.id === ftoUserId);
  if (ftoIndex !== -1) ftoQueue.splice(ftoIndex, 1);
  if (traineeQueue.length === 0) {
    await interaction.reply({ content: "Очередь стажеров пуста.", ephemeral: true });
  } else {
    const trainee = traineeQueue.shift();
    await interaction.channel?.send(`Наставник ${ftoMention} взял стажера ${trainee?.mention}.`);

    const guild = interaction.guild!;
    const guildAvatarURL = guild.iconURL() || undefined;
    const embed = {
      color: 0x8260d2,
      author: {
        name: 'Developed by perkinson for SA-ES',
        icon_url: 'https://gambit-rp.ru/assets/static/images/logotypeDrag.png',
        url: 'https://github.com/perkinson1251',
      },
      title: `Вы были взяты наставником`,
      description: `${ftoMention} вас взял в качетсве своего напарника. Свяжитесь с вашим новым наставником.`,
      timestamp: new Date(),
      footer: {
        text: `Оповещение,  ${guild.name}`,
      },
      thumbnail: {
        url: guildAvatarURL,
      },
    };

    const traineeMember = await guild.members.fetch(trainee!.id);
    await sendEmbedToUser(traineeMember.user, embed);
    await updateQueueMessage(interaction.channel as TextChannel, traineeQueue, ftoQueue, client.user?.id!);
  }
}

async function handleFtoButton(interaction: ButtonInteraction) {
  logger.info("fto button pressed");
  const userId = interaction.user.id;
  const mention = `<@${userId}>`;
  const timestamp = Math.floor(Date.now() / 1000);
  const ftoIndex = ftoQueue.findIndex(t => t.id === userId);
  if (ftoIndex === -1) {
    ftoQueue.push({ id: userId, mention, timestamp });
    await interaction.reply({ content: `Вы встали в очередь как наставник.`, ephemeral: true });
  } else {
    ftoQueue.splice(ftoIndex, 1);
    await interaction.reply({ content: `Вы вышли из очереди.`, ephemeral: true });
  }
  await updateQueueMessage(interaction.channel as TextChannel, traineeQueue, ftoQueue, client.user?.id!);
}


client.login(config.DISCORD_TOKEN);
