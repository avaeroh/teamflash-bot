import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';
import { googleQuery } from '../utils/browser/browserUtils';
import { containsNaughtyWords, rejectInteraction } from '../utils/naughtyWordHelper';
import { getRightMovePropertyInfo } from '../utils/browser/rightmoveScraper';
import { getFormattedRightMoveInfo } from '../utils/browser/rightMoveStringUtils';

const optionalLocationDescription =
  '(Optional) Add a location to find commute distance from the property';
const rightmove: ICommand = {
  data: new SlashCommandBuilder()
    .setName('rightmove')
    .addStringOption((option) =>
      option
        .setName('rightmoveurl')
        .setMinLength(1)
        .setRequired(true)
        .setDescription('Your RightMove URL link')
    )
    .addStringOption((option1) =>
      option1
        .setName('location1')
        .setDescription(optionalLocationDescription)
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(50)
    )
    .addStringOption((option2) =>
      option2
        .setName('location2')
        .setDescription(optionalLocationDescription)
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(50)
    )
    .addStringOption((option3) =>
      option3
        .setName('location3')
        .setDescription(optionalLocationDescription)
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(50)
    )
    .setDescription(`Share a Rightmove URL & I'll get the important details`),

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const rightMoveUrl = interaction.options.getString('rightmoveurl');

      const optionalLocations = [
        interaction.options.getString('location1'),
        interaction.options.getString('location2'),
        interaction.options.getString('location3'),
      ];
      console.log(
        `rightmove command called by '${interaction.member?.user.username}' searching for '${rightMoveUrl}'`
      );

      if (rightMoveUrl) {
        await interaction.deferReply({ ephemeral: true });

        //reject invalid URLs
        const rightMoveRegex = new RegExp('.*www.rightmove.co.uk/properties/[0-9].*#/.*/');
        if (rightMoveRegex.test(rightMoveUrl)) {
          rejectInteraction(interaction, rightMoveUrl, `That is an invalid Rightmove URL.`);
          return;
        }

        //reject image links
        if (rightMoveUrl.includes('id=media')) {
          rejectInteraction(
            interaction,
            rightMoveUrl,
            `Cannot process ${rightMoveUrl}, please only share the base property URL, rather than images of the property.`
          );

          return;
        }

        let propertyInfo;

        //reject locations that are naughty words
        for (const optionalLocation of optionalLocations) {
          if (containsNaughtyWords(optionalLocation)) {
            return rejectInteraction(
              interaction,
              rightMoveUrl,
              `Please don't put naughty words in the location options options.`
            );
          }
        }

        try {
          propertyInfo = await getRightMovePropertyInfo(rightMoveUrl, optionalLocations);
          propertyInfo.url = rightMoveUrl;

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
