import { VoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { ChatInputCommandInteraction, CacheType, GuildMember } from 'discord.js';

class VoiceConnectionManager {
  private static instance: VoiceConnectionManager | undefined;
  private connection: VoiceConnection | undefined;

  private constructor() {}

  public static getInstance(): VoiceConnectionManager {
    if (!VoiceConnectionManager.instance) {
      VoiceConnectionManager.instance = new VoiceConnectionManager();
    }
    return VoiceConnectionManager.instance;
  }

  public setConnection(connection: VoiceConnection): void {
    this.connection = connection;
  }

  public getConnection(): VoiceConnection | undefined {
    return this.connection;
  }
}

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

export { VoiceConnectionManager as ConnectionManager };
