import { CommandInteraction, GuildMember } from "discord.js";

export default function isAdmin(interaction: CommandInteraction): boolean {
  const member = interaction.member as GuildMember;
  return member.permissions.has("Administrator");
}
