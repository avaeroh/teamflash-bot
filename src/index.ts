// This line imports the Client class, which is going to represent your Discord bot's session.
import { Client, GatewayIntentBits, TextChannel, VoiceState } from 'discord.js';
import { onInteraction } from './handlers/onInteraction';
import { connectDatabase } from './database/connectDatabase';
import { validateEnv } from './utils/validateEnv';
import { informSam } from './utils/samsPornstarRanking';

import { UserId } from './utils/userIdEnums';
import { getRandomInt } from './utils/randomNumber';

(async () => {
  if (!validateEnv()) return;
  // We create the bot object, and login to Discord's servers with the bot token provided
  // in .env.
  const BOT = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
  connectDatabase();
  await BOT.login(process.env.BOT_TOKEN);

  // The .on() syntax is used when we want the bot to listen to a certain event.
  // Here, we listen to the ready event, which happens when the Discord bot Client is ready.
  BOT.on('ready', () => console.log('Bot is connected to Discord!'));

  // We set up another listener to watch for any "interaction" with the bot.
  // You can find more information about how general interactions work on this link:
  // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object

  // One fundamental interaction corresponds to when a user types a command, which is what
  // we're handling currently in the onInteraction handler we started writing for you.
  BOT.on('interactionCreate', async (interaction) => await onInteraction(interaction));

  // If you want your bot to do something when a message is sent, you could use the "onMessage"
  // event (BOT.on("onMessage", ...)). There are many different events that your bot can listen
  // for. You can find a list at this URL:
  // https://discord.js.org/#/docs/discord.js/main/typedef/Events

  //Some memes for when people join voice channels
  BOT.on('voiceStateUpdate', async (oldState, newState) => {
    const ANNOUNCEMENTS_CHANNEL_ID = '807540821997649941';
    // if there is no newState channel, the user has just left a channel
    const USER_LEFT = !newState.channel;
    // if there is no oldState channel, the user has just joined a channel
    const USER_JOINED = !oldState.channel;
    // if there are oldState and newState channels, but the IDs are different,
    // user has just switched voice channels
    const USER_SWITCHED = newState.channel?.id !== oldState.channel?.id;

    // if a user has just left a channel, stop executing the code
    if (USER_LEFT) return;

    if (
      // if a user has just joined or switched to a voice channel
      USER_JOINED
      // ||
      // USER_SWITCHED
      // // and the new voice channel is the same as the support channel
      // newState.channel.id === VIBE_CHANNEL_ID
    ) {
      try {
        let channel = <TextChannel>await BOT.channels.fetch(ANNOUNCEMENTS_CHANNEL_ID);

        if (newState.member!.id === UserId.CRISPE) {
          let randomInt = getRandomInt(5);
          if (randomInt === 0) await informSam(channel, newState);
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }
  });
})();
