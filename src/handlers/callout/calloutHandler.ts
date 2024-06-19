import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import Callout from "models/Callout";
import Division from "models/Division";

// @ts-expect-error: Type in progress
function returnLastItem(arr) {
  return arr[arr.length - 1];
}

export async function handleSubmitCalloutForm(
  interaction: ModalSubmitInteraction
) {
  const guildId = interaction.guild!.id;
  const channelId = interaction.channel!.id;
  const userId = interaction.user.id;

  const incidentType = interaction.fields.getTextInputValue(
    "calloutincidentTypeInput"
  );
  const incidentLocation = interaction.fields.getTextInputValue(
    "calloutincidentLocationInput"
  );
  const incidentDetails = interaction.fields.getTextInputValue(
    "calloutincidentDetailsInput"
  );
  const incidentTeamspeakChannel = interaction.fields.getTextInputValue(
    "calloutTeamspeakChannelInput"
  );

  const callouts = await Callout.find({
    guildId,
    channelId,
    userId,
    status: "active",
  }).populate("divisionId");
  const callout = returnLastItem(callouts);

  if (!callout) {
    await interaction.reply({
      content:
        "Не удалось найти данные о запросе. Пожалуйста, попробуйте снова.",
      ephemeral: true,
    });
    return;
  }

  const division = await Division.findOne({
    _id: callout.divisionId,
    guildId,
  });
  const role = interaction.guild!.roles.cache.get(division!.roleId);
  const roleMention = `<@&${division!.roleId}>`;
  const creatorMention = `<@${userId}>`;
  console.log(division?.logoUrl);
  const embed = new EmbedBuilder()
    .setColor(parseInt(role!.color.toString(16).padStart(6, "0"), 16))
    .setAuthor({ name: `${division!.name} Request` })
    .setTitle("CALLOUT")
    .addFields(
      { name: "ЗАПРОС ОТПРАВЛЕ:", value: creatorMention, inline: false },
      { name: "ТИП ИНЦИДЕНТА:", value: incidentType, inline: false },
      { name: "ЛОКАЦИЯ:", value: incidentLocation, inline: false },
      { name: "ДЕТАЛИ ИНЦИДЕНТА:", value: incidentDetails, inline: false },
      {
        name: "КАНАЛ В TEAMSPEAK",
        value: incidentTeamspeakChannel,
        inline: false,
      },
      { name: "СТАТУС", value: callout.status, inline: false },
      { name: "СОЗДАН:", value: `<t:${callout.timestamp}:R>`, inline: false }
    );

  if (division!.logoUrl !== undefined) {
    embed.setThumbnail(division!.logoUrl);
  }
  await interaction.channel?.send({ content: roleMention, embeds: [embed] });
  interaction.deferUpdate();
}
