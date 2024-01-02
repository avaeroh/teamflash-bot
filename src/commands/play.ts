import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';

import { UserId } from '../utils/userIdEnums';

import { AudioQueueManager } from '../utils/audio/audioQueueManager';
import ytdl, { validateURL } from 'ytdl-core';
import { playNextSong } from '../utils/audio/youtubePlayer';
import { ConnectionManager } from '../utils/audio/voiceConnectionManager';
import { AudioPlayerManager } from '../utils/audio/audioPlayerManager';
import { PlayerSubscription } from '@discordjs/voice';

const playCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a song to the queue')
        .addStringOption((option) =>
          option
            .setName('input')
            .setDescription('The YouTube URL of the song you want to play')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List the songs in the queue')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .addIntegerOption((option) =>
          option
            .setName('index')
            .setDescription('The index of the song to remove')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      if (interaction.user.id.toString() === UserId.BALBIN) {
        interaction.reply({
          content: `Sorry, Balbin-based commands aren't yet supported.`,
          ephemeral: true,
        });
      } else {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
          case 'add':
            await handleAddCommand(interaction);
            break;

          case 'list':
            handleListCommand(interaction);
            break;

          case 'remove':
            await handleRemoveCommand(interaction);
            break;

          default:
            interaction.reply({ content: 'Invalid subcommand.', ephemeral: true });
        }
      }
    } else {
      interaction.reply({ content: 'Interaction failed.', ephemeral: true });
    }

    async function handleAddCommand(interaction: ChatInputCommandInteraction<CacheType>) {
      const inputURL = interaction.options.getString('input');
      const queue = AudioQueueManager.getInstance();
      if (inputURL) {
        const validUrl = validateURL(inputURL);
        if (validUrl) {
          const title = (await ytdl.getBasicInfo(inputURL)).videoDetails.title;

          queue.enqueue(inputURL);

          // If the player is not currently playing, start playing the song
          if (queue.getQueue().length === 1) {
            playNextSong(interaction);
            interaction.reply({
              content: `Now playing: '${title}' as requested by ${interaction.user.username}`,
              ephemeral: true,
            });
          } else {
            interaction.reply({
              content: `'${title}' added to the queue. Queue length: ${queue.getQueue().length}`,
              ephemeral: true,
            });
          }
        } else {
          interaction.reply({ content: 'Please input a valid URL.', ephemeral: true });
        }
      } else {
        interaction.reply({ content: 'Please input a URL.', ephemeral: true });
      }
    }

    async function handleListCommand(interaction: ChatInputCommandInteraction<CacheType>) {
      const queueList = AudioQueueManager.getInstance().getQueue();

      if (queueList.length === 0) {
        interaction.reply({ content: 'The queue is empty.', ephemeral: true });
        return;
      }

      // Defer the reply to provide a loading message
      const initialReply = await interaction.deferReply({ ephemeral: true });

      try {
        // Fetch the details for all audio in the queue asynchronously
        const formattedList = await getQueueMap(queueList);

        // Update the initial reply with the formatted list
        initialReply.edit({ content: `Current queue:\n${formattedList.join('\n')}` });
      } catch (error) {
        console.error('Error fetching queue details:', (error as Error).message);
        // Update the initial reply with an error message
        initialReply.edit({ content: 'Error fetching queue details.' });
      }
    }

    async function getQueueMap(queueList: string[]) {
      const infoPromises = queueList.map((song) => ytdl.getBasicInfo(song));
      const infoList = await Promise.all(infoPromises);

      // Format the list with index and title
      const formattedList = infoList.map((info, index) => {
        let title = info.videoDetails.title;
        if (index === 0) {
          title = `(Now playing) ${title}`;
        }
        return `${index}. ${title}`;
      });
      return formattedList;
    }

    async function handleRemoveCommand(interaction: ChatInputCommandInteraction<CacheType>) {
      const indexToRemove = interaction.options.getInteger('index');
      const musicQueue = AudioQueueManager.getInstance();
      const voiceConnectionManager = ConnectionManager.getInstance();
      const player = AudioPlayerManager.getInstance().getPlayer();
      if (indexToRemove) {
        //users will use 1-indexing, but the queue is 0-indexed
        musicQueue.removeSong(indexToRemove - 1);
        if (indexToRemove === 1) {
          // If removing the first item and it is currently playing, stop playback
          player.stop();
          playNextSong(interaction);
        }
        if (musicQueue.isEmpty()) {
          interaction.reply({ content: 'The queue is empty, disconnecting.', ephemeral: true });
          player.stop();
          voiceConnectionManager.getConnection()?.destroy();
          return;
        }
        interaction.reply({
          content: `'Option ${indexToRemove} removed from queue.`,
          ephemeral: true,
        });
        const formattedList = await getQueueMap(musicQueue.getQueue());
        interaction.followUp({
          content: `Updated queue:\n${formattedList.join('\n')}`,
          ephemeral: true,
        });
      } else {
        interaction.reply({ content: 'Please input an index.', ephemeral: true });
        return;
      }
    }
  },
};

module.exports = playCommand;
