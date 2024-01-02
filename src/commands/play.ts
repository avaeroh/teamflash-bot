import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';

import { UserId } from '../utils/userIdEnums';

import { MusicQueue } from '../utils/audio/musicQueue';
import ytdl, { validateURL } from 'ytdl-core';
import { playNextSong } from '../utils/audio/youtubePlayer';
import { VoiceConnection } from '@discordjs/voice';
import { joinUsersChannel } from '../utils/audio/voiceChannelHelper';

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
      if (inputURL) {
        const validUrl = validateURL(inputURL);
        if (validUrl) {
          const connection: VoiceConnection = joinUsersChannel(interaction)!;
          const title = (await ytdl.getBasicInfo(inputURL)).videoDetails.title;
          const queue = MusicQueue.getInstance();
          MusicQueue.getInstance().enqueue(inputURL);

          // If the player is not currently playing, start playing the song
          if (queue.isEmpty() || queue.getQueue().length === 1) {
            playNextSong(interaction, connection, queue);
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
      const queueList = MusicQueue.getInstance().getQueue();

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
      if (indexToRemove) {
        MusicQueue.getInstance().removeSong(indexToRemove - 1);
      } else {
        interaction.reply({ content: 'Please input an index.', ephemeral: true });
        return;
      }
      MusicQueue.getInstance().removeSong(indexToRemove);
      interaction.reply({
        content: `'Option ${indexToRemove} removed from queue.`,
        ephemeral: true,
      });
      const formattedList = await getQueueMap(MusicQueue.getInstance().getQueue());
      interaction.followUp({
        content: `Updated queue:\n${formattedList.join('\n')}`,
        ephemeral: true,
      });
    }
  },
};

module.exports = playCommand;
