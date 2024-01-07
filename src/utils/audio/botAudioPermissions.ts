import {
  ChatInputCommandInteraction,
  CacheType,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';

export function canBotJoinChannelAndSpeak(
  interaction: ChatInputCommandInteraction<CacheType>
): boolean {
  if (interaction.member instanceof GuildMember) {
    if (interaction.member.voice.channel) {
      const botsPermissionsForChannel = interaction.member.voice.channel.permissionsFor(
        interaction.guild!.members.me!
      );
      if (
        botsPermissionsForChannel.has(PermissionFlagsBits.Connect) &&
        botsPermissionsForChannel.has(PermissionFlagsBits.ViewChannel) &&
        botsPermissionsForChannel.has(PermissionFlagsBits.Speak)
      ) {
        return true;
      }
    }
  }
  return false;
}
