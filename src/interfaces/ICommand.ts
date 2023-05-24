import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';

/**
 * Here, we define the Command interface. Its purpose is to specify the format
 * of our Command objects. This is to make sure that we stay consistent when
 * dealing with Commands.
 */

export interface ICommand {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  //   execute: (interaction: CommandInteraction) => Promise<void>;
  execute: (interaction: CommandInteraction) => Promise<void>;
}
