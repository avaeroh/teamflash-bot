import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';

const help: ICommand = {
  data: new SlashCommandBuilder().setName('help').setDescription('List commands that I support!'),

  async execute(interaction) {
    await interaction.reply({
      content: `Currently supporting:
    \n/numberwang <Number> | To compete in Numberwang, can you get the high score?
    \n/play <Youtube URL> | To listen to YouTube audio.
    \n/roulette | Randomly kicks a user from the voice channel. Not yet implemented.
    \n/help | Literally this thing you're reading now. 
    `,
      ephemeral: true,
    });
  },
};

module.exports = help;
