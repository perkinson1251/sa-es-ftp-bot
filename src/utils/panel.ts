import { EmbedBuilder } from "discord.js";

export const panel = new EmbedBuilder()
  .setColor(0x0099ff)
  .setTitle('FIELD TRAINING PROGRAM QUEUE')
  .setAuthor({
    name: 'Developed by perkinson for SA-ES',
    url: 'https://github.com/perkinson1251',
  })
  .setDescription('Система очереди для стажеров и их наставников. Автокик стажёра из очереди происходит через 1 час ожидания.\nИнструкция:\n**СТАЖЕР** - встать/выйти из очереди, используется стажёрами.\n**ВЗЯТЬ** - взять первого в очереди стажёра, используется FTO.\n**ФТО** - встать/выйти из очереди, используется FTO.')
  .addFields(
    { name: 'СТАЖЕРЫ', value: 'Нет стажеров в очереди', inline: true },
    { name: 'ПОЛЕВЫЕ ОФИЦЕРЫ', value: 'Нет полевых офицеров в очереди', inline: true }
  );
