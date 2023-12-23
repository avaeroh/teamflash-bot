import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';

const help: ICommand = {
  data: new SlashCommandBuilder().setName('help').setDescription('List commands that I support!'),

  async execute(interaction) {
    await interaction.reply({
      content: `Currently supporting:
    \n/numberwang <Number> | To compete in Numberwang, can you get the high score?
    \n/play add <Youtube URL> | To play/add YouTube audio to the queue.
    \n/play list | To list the songs currently in the queue.
    \n/play remove <Queue number> | To remove an item from the queue. Note: Removing the current playing song will not yet immediately terminate its play.
    \n/help | Literally this thing you're reading now. 
    `,
      ephemeral: true,
    });
  },
};

module.exports = help;
