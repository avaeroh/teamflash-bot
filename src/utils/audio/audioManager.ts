import { AudioPlayer, createAudioPlayer } from '@discordjs/voice';

export class AudioManager {
  private static instance: AudioManager | null = null;
  private player: AudioPlayer;

  private constructor() {
    this.player = createAudioPlayer();
    this.player.on('error', (error) => {
      console.error('Error:', error.message, 'with track');
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public getPlayer(): AudioPlayer {
    return this.player;
  }
}
