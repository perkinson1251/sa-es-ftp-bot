import { EmbedBuilder, TextChannel } from 'discord.js';
import { IQueue } from '../interfaces/IQueue';
import { panel } from './panel';

export default async function updateQueueMessage(
  channel: TextChannel, 
  traineeQueue: IQueue[], 
  ftoQueue: IQueue[], 
  clientUserId: string
) {
  const trainees = traineeQueue.map(t => `${t.mention} - <t:${t.timestamp}:R>`).join('\n') || 'Нет стажеров в очереди';
  const ftos = ftoQueue.map(t => `${t.mention} - <t:${t.timestamp}:R>`).join('\n') || 'Нет полевых офицеров в очереди';

  const messages = await channel.messages.fetch();
  const queueMessage = messages.find(msg => msg.author.id === clientUserId && msg.embeds[0]?.title === 'FIELD TRAINING PROGRAM QUEUE');
  
  const embed = EmbedBuilder.from(panel).setFields(
    { name: 'СТАЖЕРЫ', value: trainees, inline: true },
    { name: 'ПОЛЕВЫЕ ОФИЦЕРЫ', value: ftos, inline: true }
  );

  if (queueMessage) {
    await queueMessage.edit({ embeds: [embed] });
  } else {
    await channel.send({ embeds: [embed] });
  }
}