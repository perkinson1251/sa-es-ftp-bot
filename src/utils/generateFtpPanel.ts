import { config } from "config";
import { EmbedBuilder } from "discord.js";
import Queue from "../models/Queue";

export const generateFtpPanel = async (guildId: string) => {
  const traineeQueue = await Queue.find({ guildId, type: "trainee" });
  const ftoQueue = await Queue.find({ guildId, type: "fto" });

  const trainees =
    traineeQueue.map((t) => `${t.mention} - <t:${t.timestamp}:R>`).join("\n") ||
    "Нет стажеров в очереди";
  const ftos =
    ftoQueue.map((t) => `${t.mention} - <t:${t.timestamp}:R>`).join("\n") ||
    "Нет полевых офицеров в очереди";

  const panel = new EmbedBuilder()
    .setColor(0x8260d2)
    .setTitle("FIELD TRAINING PROGRAM QUEUE")
    .setAuthor({
      name: "Developed by perkinson for SA-ES",
      url: "https://github.com/perkinson1251",
      iconURL: "https://gambit-rp.ru/assets/static/images/logotypeDrag.png",
    })
    .setDescription(
      `Система очереди для стажеров и их наставников. Автокик стажёра из очереди происходит через ${config.AUTO_REMOVE_TIME} минут ожидания.\n\nИнструкция:\n**СТАЖЕР** - встать/выйти из очереди, используется стажёрами.\n**ВЗЯТЬ** - взять первого в очереди стажёра, используется FTO.\n**ФТО** - встать/выйти из очереди, используется FTO.`
    )
    .addFields(
      { name: "СТАЖЕРЫ", value: trainees, inline: true },
      {
        name: "ПОЛЕВЫЕ ОФИЦЕРЫ",
        value: ftos,
        inline: true,
      }
    )
    .setImage("https://i.imgur.com/xFw3ZZe.gif")
    .setFooter({
      text: "Без примеров невозможно ни правильно учить, ни успешно учиться.",
    });

  return panel;
};
