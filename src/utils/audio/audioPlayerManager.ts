import { AudioPlayer, createAudioPlayer } from '@discordjs/voice';

export class AudioPlayerManager {
  private static instance: AudioPlayerManager | null = null;
  private player: AudioPlayer;

  private constructor() {
    this.player = createAudioPlayer();
    this.player.on('error', (error) => {
      console.error('Error:', error.message, 'with track');
    });
  }

  public static getInstance(): AudioPlayerManager {
    if (!AudioPlayerManager.instance) {
      AudioPlayerManager.instance = new AudioPlayerManager();
    }
    return AudioPlayerManager.instance;
  }

  public getPlayer(): AudioPlayer {
    return this.player;
  }
}
