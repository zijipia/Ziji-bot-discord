const { Events } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
  name: Events.VoiceStateUpdate,
  type: 'events',

  /**
   * @param { import('discord.js').VoiceState } oldState
   * @param { import('discord.js').VoiceState } newState
   */

  execute: async (oldState, newState) => {
    const client = oldState.client;

    const queue = useQueue(oldState?.guild?.id);

    if (!queue?.node.isPlaying()) return;

    const botChannel = oldState?.guild?.channels?.cache?.get(queue.dispatcher?.voiceConnection?.joinConfig?.channelId);
    if (!botChannel || botChannel.id !== oldState.channelId) return;

    const requestedMember = botChannel.members.get(queue.metadata?.requestedBy?.id);
    if (requestedMember) return;

    const nonBotMembers = botChannel.members.filter((m) => !m.user.bot);
    if (nonBotMembers.size < 1) return;

    const randomMember = nonBotMembers.random();
    const ziset = client.functions.get('EditMetadata');
    await ziset.execute(oldState.guild, { requestedBy: randomMember.user });
  },
};
