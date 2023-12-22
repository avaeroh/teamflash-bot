import { joinVoiceChannel } from '@discordjs/voice';
import { CacheType, ChatInputCommandInteraction, GuildMember } from 'discord.js';

export function joinUsersChannel(interaction: ChatInputCommandInteraction<CacheType>) {
  if (interaction.member instanceof GuildMember) {
    if (interaction.member.voice.channel) {
      console.log(`Joining voice channel '${interaction.member.voice.channel.name}'`);
      return joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild!.id,
        adapterCreator: interaction.guild!.voiceAdapterCreator,
        selfDeaf: false,
      });
    } else {
      interaction.reply({
        content: `I can't join an invalid channel, or one I don't have permission to view`,
        ephemeral: true,
      });
    }
  }
}
