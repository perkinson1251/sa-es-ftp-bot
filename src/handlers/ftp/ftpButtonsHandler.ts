import { ButtonInteraction } from "discord.js";
import Queue from "models/Queue";
import { logToChannel } from "utils/logToChannel";
import logger from "utils/logger";
import sendEmbedToUser from "utils/sendEmbed";

export async function handleFtpButtons(interaction: ButtonInteraction) {
  const customId = interaction.customId;
  logger.info(`Button pressed: ${customId}`);
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
}

async function handleTraineeButton(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild?.id;
  const mention = `<@${userId}>`;
  const timestamp = Math.floor(Date.now() / 1000);

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
