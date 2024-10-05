const { useMainPlayer, useQueue } = require('discord-player');
const { ButtonInteraction } = require('discord.js');
const player = useMainPlayer();
module.exports.data = {
  name: 'B_queue_refresh',
  type: 'button',
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
  const queue = useQueue(interaction.guild.id);
  const QueueTrack = interaction.client.functions.get('Queue');
  QueueTrack.execute(interaction, queue, true);
  return;
};
