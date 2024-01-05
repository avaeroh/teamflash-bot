import { CacheType, ChatInputCommandInteraction } from 'discord.js';

const badWordsListRegex = require('badwords-list').regex;

export function containsNaughtyWords(message: string | null): boolean {
  return badWordsListRegex.test(message);
}

export function rejectInteraction(
  interaction: ChatInputCommandInteraction<CacheType>,
  inputText: string,
  warning: string
) {
  interaction.followUp({
    content: warning,
    ephemeral: true,
  });
  console.warn(`REJECETED: '${interaction.member?.user.username}' searching for '${inputText}'`);
  return;
}
