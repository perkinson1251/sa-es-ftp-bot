import {
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Callout from "models/Callout";

export async function handleSelectDivisionForCallout(
  interaction: StringSelectMenuInteraction
) {
  const selectedDivisionId = interaction.values[0];
  console.log(selectedDivisionId);
  const guildId = interaction.guild!.id;
  const channelId = interaction.channel!.id;
  const userId = interaction.user.id;
  const timestamp = Math.floor(Date.now() / 1000);

  await Callout.create({
    guildId,
    channelId,
    userId,
    divisionId: selectedDivisionId,
    timestamp,
  });

  const modal = new ModalBuilder()
    .setCustomId("calloutInfoModal")
    .setTitle("Подробности");

  const incidentTypeInput = new TextInputBuilder()
    .setCustomId("calloutincidentTypeInput")
    .setLabel("Тип инцидента")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Штурм, задержание");

  const incidentLocationInput = new TextInputBuilder()
    .setCustomId("calloutincidentLocationInput")
    .setLabel("Локация")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Ист ЛС, центральная станция");

  const incidentDetailsInput = new TextInputBuilder()
    .setCustomId("calloutincidentDetailsInput")
    .setLabel("Подробности")
    .setStyle(TextInputStyle.Paragraph);

  const incidentTeamspeakChannelInput = new TextInputBuilder()
    .setCustomId("calloutTeamspeakChannelInput")
    .setLabel("Канал в Teamspeak")
    .setStyle(TextInputStyle.Short);

  const incidentTypeActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(incidentTypeInput);
  const incidentLocationActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      incidentLocationInput
    );
  const incidentDetailsActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      incidentDetailsInput
    );
  const incidentTeamspeakChannelActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      incidentTeamspeakChannelInput
    );

  modal.addComponents(
    incidentTypeActionRow,
    incidentLocationActionRow,
    incidentDetailsActionRow,
    incidentTeamspeakChannelActionRow
  );

  await interaction.showModal(modal);
}
