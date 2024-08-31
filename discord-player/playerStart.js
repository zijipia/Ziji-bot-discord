const {
  useMainPlayer,
  GuildQueue,
  Track,
  GuildQueueEvent,
} = require('discord-player');
const config = require('../config');
const players = useMainPlayer();

module.exports = {
  name: GuildQueueEvent.playerStart,
  type: 'Player',
  /**
   *
   * @param { GuildQueue } queue
   * @param { Track } track
   * @returns
   */
  execute: async (queue, track) => {
    const player = players.client.functions.get('player_func');

    if (!player) return;
    const res = await player.execute(players.client, queue, track);
    if (queue.metadata.mess) return queue.metadata.mess.edit(res);
    const EditMetadata = players.client.functions.get('EditMetadata');
    const messengerr = await queue.metadata.channel.send(res);
    await EditMetadata.execute(queue.guild, { mess: messengerr });
  },
};
