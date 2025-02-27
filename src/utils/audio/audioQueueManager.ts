export class AudioQueueManager {
  private static instance: AudioQueueManager;
  private queue: string[] = [];

  private constructor() {}

  public static getInstance(): AudioQueueManager {
    if (!AudioQueueManager.instance) {
      AudioQueueManager.instance = new AudioQueueManager();
    }
    return AudioQueueManager.instance;
  }

  public enqueue(song: string): void {
    this.queue.push(song);
  }

  public dequeue(): string | undefined {
    console.log(`Dequeueing song. Queue length: ${this.queue.length}`);
    return this.queue.shift();
  }

  public remove(): string | undefined {
    console.log(`Dequeueing song. Queue length: ${this.queue.length}`);
    return this.queue.shift();
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public getQueue(): string[] {
    return [...this.queue];
  }

  public clearQueue(): void {
    this.queue = [];
    console.log('Cleared queue.');
  }

  public removeSong(index: number): string | undefined {
    if (index < 0 || index >= this.queue.length) {
      console.log(
        `Invalid index ${index} for song queue removal. Queue length: ${this.queue.length}`
      );
      return undefined;
    }
    const removedSong = this.queue.splice(index, 1)[0];
    console.log(`Removed song at index ${index}. Queue length: ${this.queue.length}`);
    return removedSong;
  }
}
