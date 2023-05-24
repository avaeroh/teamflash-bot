import { TextChannel, VoiceState } from 'discord.js';

export async function getSamsPornStarInfo(): Promise<SamsPornStarInfo> {
  const pornhub = require('@justalk/pornhub-api');
  return await pornhub.model('leana lovings', [
    'title',
    'rank_model',
    'profile_views',
    'relationship_status',
    'rank_month_model',
    'rank_last_month_model',
  ]);
}

export type SamsPornStarInfo = {
  title: string;
  rank_model: number;
  profile_views: number;
  relationship_status: string;
  rank_month_model: string;
  rank_last_month_model: string;
};

export async function informSam(channel: TextChannel, newState: VoiceState) {
  const updates = await getSamsPornStarInfo();
  let wahey = '😥';
  if (updates.relationship_status.toLowerCase() === 'single') {
    wahey = `👀🍆🥵`;
  }
  channel!.send(
    `Hey @${newState.member!.displayName}! Just to keep you in the loop...\n${
      updates.title
    } is currently ranked '${updates.rank_month_model}' on PornHub for this month, from '${
      updates.rank_last_month_model
    }' last month. \nHer relationship status is currently: ${updates.relationship_status} ${wahey}.`
  );
}
