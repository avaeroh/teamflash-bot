import { Collection, CommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';
import { UserId } from '../utils/userIdEnums';
import { joinUsersChannel } from '../utils/voiceChannelHelper';
import { playFromYoutubeURL } from '../utils/youtubePlayer';

const rouletteCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Discord Russian roulette! [NOT YET IMPLEMENTED]'),

  async execute(interaction) {
    if (interaction.member instanceof GuildMember) {
      if (interaction.member.voice.channel) {
        if (interaction.member.permissions.has('KickMembers')) {
          if (interaction.isChatInputCommand()) {
            await playFromYoutubeURL(interaction, 'https://www.youtube.com/watch?v=Fn0IBlb8GQg');

            //uncomment if permissions are set
            //     try {
            //       interaction.guild!.members.kick(UserId.LTLMX);
            //     } catch (err) {
            //       interaction.reply({
            //         content: `Looks like I can't kick LTLMX right now.`,
            //         ephemeral: true,
            //       });
            //       console.log(err);
            //     }
            //   }
            // } else {
            //   try {
            //     interaction.member.kick(`Nice try ${interaction.member.user}. 🔫 Goodbye 🔫.`);
            //   } catch (err) {
            //     interaction.reply({
            //       content: `Looks like I don't have permisisons to kick ${interaction.member.user}`,
            //       ephemeral: true,
            //     });
            //     console.log(err);
          }
        }
      } else {
        interaction.reply({
          content: `You need to be in a voice channel to use this command. ${interaction.member.user}.`,
          ephemeral: true,
        });
      }
    }
  },
};

// This is super important and allows other
// .ts files in the project to access the
// ICommand object created above!
module.exports = rouletteCommand;
