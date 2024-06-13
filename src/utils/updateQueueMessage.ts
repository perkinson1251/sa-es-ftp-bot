import { EmbedBuilder, TextChannel } from 'discord.js';
import { panel } from './panel';

interface QueueEntry {
  id: string;
  mention: string;
  timestamp: number;
}

export default async function updateQueueMessage(
  channel: TextChannel, 
  traineeQueue: QueueEntry[], 
  ftoQueue: QueueEntry[], 
  clientUserId: string
) {
  const trainees = traineeQueue.map(t => `${t.mention} - <t:${t.timestamp}:R>`).join('\n') || 'Нет стажеров в очереди';
  const ftos = ftoQueue.map(t => `${t.mention} - <t:${t.timestamp}:R>`).join('\n') || 'Нет полевых офицеров в очереди';

  const messages = await channel.messages.fetch({ limit: 100 });
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