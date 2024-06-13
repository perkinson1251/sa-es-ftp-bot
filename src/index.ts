import { ButtonInteraction, Client, GatewayIntentBits, TextChannel } from "discord.js";
import { commands } from "./commands";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";
import updateQueueMessage from "./utils/updateQueueMessage";

let traineeQueue: { id: string, mention: string, timestamp: number }[] = [];
let ftoQueue: { id: string, mention: string, timestamp: number }[] = [];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
});

client.once("ready", async () => {
  console.log(`Discord bot is ready! ${client.user?.username} is online.`);
  const guilds = await client.guilds.fetch();
  console.log(`Bot is in ${guilds.size} guild(s).`);
  guilds.forEach(async (guild) => {
    console.log(`Deploying commands for guild: ${guild.id}`);
    await deployCommands({ guildId: guild.id });
  });
});

client.on("guildCreate", async (guild) => {
  console.log(`Bot added to guild: ${guild.id}`);
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;
    console.log(`Received command: ${commandName}`);
    const command = commands[commandName as keyof typeof commands];

    if (command) {
      try {
        console.log(`Executing command: ${commandName}`);
        await command.execute(interaction);
        console.log(`Command executed: ${commandName}`);
      } catch (error) {
        console.error(`Error executing ${commandName}:`, error);
        await interaction.reply({ content: "Что-то пошло не так...", ephemeral: true });
      }
    } else {
      console.error(`Command not found: ${commandName}`);
    }
  }
  if (interaction.isButton()) {
    const customId = interaction.customId;
    console.log(`Button pressed: ${customId}`);
    try {
      switch (customId) {
        case 'trainee':
          await handleTraineeButton(interaction);
          break;
        case 'take':
          await handleTakeButton(interaction);
          break;
        case 'fto':
          await handleFtoButton(interaction);
          break;
        default:
          console.log(`Unhandled button: ${customId}`);
      }
    } catch (error) {
      console.error(`Error handling button interaction ${customId}:`, error);
      await interaction.reply({ content: "Что-то пошло не так...", ephemeral: true });
    }
  }
});

async function handleTraineeButton(interaction: ButtonInteraction) {
  console.log("Trainee button pressed");
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
  console.log("Take button pressed");
  if (traineeQueue.length === 0) {
    await interaction.reply({ content: "Очередь стажеров пуста.", ephemeral: true });
  } else {
    const trainee = traineeQueue.shift();
    await interaction.reply({ content: `Вы взяли стажера ${trainee?.mention}.`, ephemeral: true });
    await updateQueueMessage(interaction.channel as TextChannel, traineeQueue, ftoQueue, client.user?.id!);
  }
}

async function handleFtoButton(interaction: ButtonInteraction) {
  console.log("FTO button pressed");
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
