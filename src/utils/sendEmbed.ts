import { User } from "discord.js";

export default async function sendEmbedToUser(user: User, embed: any) {
  try {
    await user.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Error sending embed to user ${user.username}:`, error);
  }
}