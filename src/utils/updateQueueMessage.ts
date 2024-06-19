import { TextChannel } from "discord.js";
import { IQueue } from "../interfaces/IQueue";
import { generateFtpPanel } from "./generateFtpPanel";

export default async function updateQueueMessage(
  channel: TextChannel,
  traineeQueue: IQueue[],
  ftoQueue: IQueue[],
  clientUserId: string
) {
  const messages = await channel.messages.fetch();
  const queueMessage = messages.find(
    (msg) =>
      msg.author.id === clientUserId &&
      msg.embeds[0]?.title === "FIELD TRAINING PROGRAM QUEUE"
  );

  const panelEmbed = await generateFtpPanel(channel.guild.id);

  if (queueMessage) {
    await queueMessage.edit({ embeds: [panelEmbed] });
  } else {
    await channel.send({ embeds: [panelEmbed] });
  }
}
