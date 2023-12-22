import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';
import { validateURL } from 'ytdl-core';

import { UserId } from '../utils/userIdEnums';

import { playFromYoutubeURL } from '../utils/youtubePlayer';

const playCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('play')
    .addStringOption((option) =>
      option
        .setName('input')
        .setDescription('The YouTube URL of the song you want to play')
        .setRequired(true)
    )
    .setDescription('Enter YouTube URL'),

  async execute(interaction) {
    //tidy this up when bothered
    if (interaction.isChatInputCommand()) {
      if (interaction.user.id.toString() === UserId.BALBIN) {
        interaction.reply({
          content: `Sorry, Balbin-based commands aren't yet supported.`,
          ephemeral: true,
        });
      } else {
        const inputURL = interaction.options.getString('input');
        if (inputURL) {
          const validUrl = validateURL(inputURL);
          await playAudio(interaction, validUrl, inputURL);
        } else {
          interaction.reply({ content: 'Please input a URL.', ephemeral: true });
        }
      }
    } else {
      interaction.reply({ content: 'Interaction failed.', ephemeral: true });
    }

    async function playAudio(
      interaction: ChatInputCommandInteraction<CacheType>,
      validUrl: boolean,
      inputURL: string
    ) {
      if (validUrl) {
        await playFromYoutubeURL(interaction, inputURL);
      } else {
        interaction.reply({ content: 'Invalid URL provided.', ephemeral: true });
      }
    }
  },
};

module.exports = playCommand;
