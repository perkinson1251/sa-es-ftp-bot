import { Client, GatewayIntentBits } from "discord.js";
import { commands } from "./commands";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";

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
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
      }
    } else {
      console.error(`Command not found: ${commandName}`);
      console.log("Available commands:", Object.keys(commands));
    }
  }
  if (interaction.isButton()) {
    const customId = interaction.customId;
    console.log(`Button pressed: ${customId}`);
  }
});

client.login(config.DISCORD_TOKEN);
