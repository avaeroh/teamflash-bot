import { createAudioPlayer, VoiceConnection, createAudioResource } from '@discordjs/voice';
import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import ytdl from 'ytdl-core';
import { joinUsersChannel } from './voiceChannelHelper';

export async function playFromYoutubeURL(
  interaction: ChatInputCommandInteraction<CacheType>,
  inputURL: string
) {
  const player = createAudioPlayer();
  player.on('error', (error) => {
    console.error('Error:', error.message, 'with track');
  });
  const connection: VoiceConnection = joinUsersChannel(interaction)!;
  const stream = ytdl(inputURL, { filter: 'audioonly' });
  let title = (await ytdl.getInfo(inputURL)).videoDetails.title;
  console.log(`now playing: '${title}', as requested by '${interaction.user.username}'`);
  const resource = createAudioResource(stream);
  player.play(resource);
  const subscription = connection.subscribe(player);
}
