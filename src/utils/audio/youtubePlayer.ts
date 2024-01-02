import { VoiceConnection, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import ytdl from 'ytdl-core';
import { AudioManager } from './audioManager';
import { MusicQueue } from './audioQueueManager';
import { ConnectionManager, joinUsersChannel } from './voiceConnectionManager';

export async function playNextSong(interaction: ChatInputCommandInteraction<CacheType>) {
  const queue = MusicQueue.getInstance();
  const audioManager = AudioManager.getInstance();
  const player = audioManager.getPlayer();

  const connectionManager = ConnectionManager.getInstance();
  let connection = connectionManager.getConnection();

  if (!connection) {
    connection = joinUsersChannel(interaction)!;
  }

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

  // queue.dequeue();

  if (!queue.isEmpty()) {
    console.log(`Playing next song in queue. Queue length: ${queue.getQueue().length}`);
    playNextSong(interaction);
  } else {
    console.log('Queue is empty.');
  }
}
