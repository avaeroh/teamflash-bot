import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  SlashCommandBuilder,
  User,
} from 'discord.js';
import { ICommand } from '../interfaces/ICommand';
import ytdl, { validateURL } from 'ytdl-core';
import fs, { createReadStream } from 'fs';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { VoiceConnection } from '@discordjs/voice';
import numberwangModel, { INumberwang, Numberwang } from '../database/models/numberwangModel';
import { Types } from 'mongoose';
import { getRandomInt } from '../utils/randomNumber';

const numberwangCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('numberwang')
    .addStringOption((option) =>
      option
        .setName('number')
        .setDescription('Your numberwang answer')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(100)
    )
    .setDescription('Play numberwang?'),

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      //Setup of game
      const number = getRandomInt(10);
      const userInput = interaction.options.getString('number');

      //Pull user from DB
      let playerData = await numberwangModel.findOne({ discordId: interaction.member });

      //if no data, create
      if (!playerData) {
        let playerData = await numberwangModel.create({
          //need to validate this
          discordId: interaction.member,
          //should use this at the end
          highScore: 0,
          currentScore: 1,
          timestamp: Date.now(),
        });
        interaction.reply({
          content: `Welcome to Numberwang ${interaction.member}! Let's see... that's numberwang!`,
          ephemeral: true,
        });
        await playerData.save();
      }
      if (playerData) {
        //game success
        if (number < 9 && number > 0) {
          playerData.currentScore++;
          interaction.reply({
            content: getHappyResponse(userInput!, interaction.member!.toString()),
            ephemeral: true,
          });
          await manageScore(playerData, false);
        }
        //game failure
        if (number === 9) {
          const failure = true;
          interaction.reply({
            content: `Sorry ${
              interaction.member
            }, '${userInput}' is not a number! Your score for this round is ${
              playerData.currentScore
            }, and your highscore is  ${playerData.highScore}.
            \n The current high score is: ${await getHighScore()}`,
            ephemeral: true,
          });
          await manageScore(playerData, failure);
        }
      }
    }
  },
};

async function getHighScore() {
  const highscore = await numberwangModel
    .find({})
    .sort({ highScore: -1 })
    .limit(1)
    .then((row) => [row[0].discordId, row[0].highScore]);
  return `${highscore[0]} with ${highscore[1]} points!`;
}

async function manageScore(playerData: INumberwang & { _id: Types.ObjectId }, failure = false) {
  if (playerData.currentScore > playerData.highScore) {
    playerData.highScore = playerData.currentScore;
  }
  if (failure) {
    playerData.currentScore = 0;
  }
  await playerData.save();
}

export function getHappyResponse(user: string, input: string) {
  const responseNumber = getRandomInt(5);
  if (responseNumber <= 2) return `[${input}] | ${user}, that's numberwang!`;
  if (responseNumber === 3) return `[${input}] | ${user}, numberwang!`;
  if (responseNumber === 4) return `[${input}] | ${user}, NUMBERWANG!`;
  if (responseNumber === 5) return `[${input}] | ${user} that is a numberwang!`;
}

module.exports = numberwangCommand;
