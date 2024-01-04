import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';
import { googleQuery } from '../utils/browserUi';
import { containsNaughtyWords, rejectInteraction } from '../utils/naughtyWordHelper';

const badWordsListRegex = require('badwords-list').regex;

const google: ICommand = {
  data: new SlashCommandBuilder()
    .setName('google')
    .addStringOption((option) =>
      option
        .setName('search')
        .setMinLength(1)
        .setMaxLength(100)
        .setDescription('What do you want to search for?')
    )
    .setDescription(`Google something, I'll return the top 10 results!`),

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const question = interaction.options.getString('search');
      console.log(
        `Google command called by '${interaction.member?.user.username}' searching for '${question}'`
      );

      if (question) {
        await interaction.deferReply({ ephemeral: true });
        if (containsNaughtyWords(question!)) {
          rejectInteraction(
            interaction,
            question,
            `I don't think I want to search for that, ${interaction.member!.user}.`
          );
          console.warn(
            `REJECETED: '${interaction.member?.user.username}' searching for '${question}'`
          );
          return;
        }

        let response;
        try {
          response = await googleQuery(question);
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            content: `Something went wrong, sorry!`,
            ephemeral: true,
          });
          return;
        }

        await interaction.followUp({
          content: `${response.join('\n')}`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `You didn't ask me anything!`,
          ephemeral: true,
        });
      }
    }
  },
};

module.exports = google;
