import {
  createAudioPlayer,
  VoiceConnection,
  createAudioResource,
  AudioPlayerStatus,
} from '@discordjs/voice';
import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import ytdl from 'ytdl-core';
import { joinUsersChannel } from './voiceChannelHelper';
import { MusicQueue } from './musicQueue';

export async function playFromYoutubeURL(
  interaction: ChatInputCommandInteraction<CacheType>,
  inputURL?: string
) {
  if (!inputURL) {
    interaction.reply({ content: 'Please provide a valid URL.', ephemeral: true });
    return;
  }

  const queue = MusicQueue.getInstance();
  const connection: VoiceConnection = joinUsersChannel(interaction)!;
  const title = (await ytdl.getBasicInfo(inputURL)).videoDetails.title;

  // Add the song to the queue
  queue.enqueue(inputURL);

  // If the player is not currently playing, start playing the song
  if (queue.isEmpty() || queue.getQueue().length === 1) {
    console.log(`'${title}' will be played immediately. Queue length: ${queue.getQueue().length}`);
    playNextSong(interaction, connection, queue);
  } else {
    console.log(`'${title}' added to the queue. Queue length: ${queue.getQueue().length}`);
  }
}

async function playNextSong(
  interaction: ChatInputCommandInteraction<CacheType>,
  connection: VoiceConnection,
  queue: MusicQueue
) {
  const player = createAudioPlayer();
  player.on('error', (error) => {
    console.error('Error:', error.message, 'with track');
  });

  const inputURL = queue.getQueue()[0]; // Peek at the front of the queue without dequeueing
  if (!inputURL) {
    console.error('Attempted to play undefined URL.');
    return;
  }

  const stream = ytdl(inputURL, { filter: 'audioonly' });
  let title = (await ytdl.getInfo(inputURL)).videoDetails.title;
  console.log(`Now playing: '${title}', as requested by '${interaction.user.username}'`);

  const resource = createAudioResource(stream);
  player.play(resource);

  const subscription = connection.subscribe(player);

  // Wait for the player to enter the Idle state (song playback finished)
  try {
    await new Promise<void>((resolve, reject) => {
      player.on(AudioPlayerStatus.Idle, () => resolve());
      player.on('error', (error) => reject(error));
    });
  } catch (error) {
    console.error('Error waiting for player to enter Idle state:', (error as Error).message);
  }

  // Remove the finished song from the queue
  queue.dequeue();

  // If there are more songs in the queue, play the next one
  if (!queue.isEmpty()) {
    console.log(`Playing next song in queue. Queue length: ${queue.getQueue().length}`);
    playNextSong(interaction, connection, queue);
  } else {
    console.log('Queue is empty.');
  }
}
