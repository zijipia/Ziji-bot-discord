const { useMainPlayer, useQueue } = require('discord-player');
const { ButtonInteraction } = require('discord.js');
const player = useMainPlayer();
module.exports.data = {
  name: 'B_player_next',
  type: 'button',
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
  interaction.deferUpdate();
  const queue = useQueue(interaction.guild.id);
  if (!queue) return;
  if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id) return;
  queue.node.skip();
};
