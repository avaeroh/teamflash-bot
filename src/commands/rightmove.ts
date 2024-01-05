import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';
import { googleQuery } from '../utils/browser/browserUtils';
import { rejectInteraction } from '../utils/naughtyWordHelper';
import { getRightMovePropertyInfo } from '../utils/browser/rightmove';
import { getFormattedRightMoveInfo } from '../utils/browser/rightMoveStringUtils';

const rightmove: ICommand = {
  data: new SlashCommandBuilder()
    .setName('rightmove')
    .addStringOption((option) =>
      option
        .setName('rightmoveurl')
        .setMinLength(1)

        .setDescription('Your RightMove URL link')
    )
    .setDescription(`Share a Rightmove URL & I'll get the important details`),

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const rightMoveUrl = interaction.options.getString('rightmoveurl');
      console.log(
        `rightmove command called by '${interaction.member?.user.username}' searching for '${rightMoveUrl}'`
      );

      if (rightMoveUrl) {
        await interaction.deferReply({ ephemeral: true });
        const rightMoveRegex = new RegExp('.*www.rightmove.co.uk/properties/[0-9].*#/.*/');

        if (rightMoveRegex.test(rightMoveUrl)) {
          rejectInteraction(interaction, rightMoveUrl, `That is an invalid Rightmove URL.`);
          console.warn(
            `REJECETED: '${interaction.member?.user.username}' sending rightmove URL as '${rightMoveUrl}'`
          );
          return;
        }

        let propertyInfo;
        try {
          propertyInfo = await getRightMovePropertyInfo(rightMoveUrl);

          await interaction.followUp({
            content: `${await getFormattedRightMoveInfo(propertyInfo)}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            content: `Something went wrong, sorry!`,
            ephemeral: true,
          });
          return;
        }
      } else {
        await interaction.reply({
          content: `Please submit a URL`,
          ephemeral: true,
        });
      }
    }
  },
};

module.exports = rightmove;
