const { useMainPlayer, useQueue } = require('discord-player');
const { ButtonInteraction } = require('discord.js');
const player = useMainPlayer();
module.exports.data = {
  name: 'B_queue_clear',
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
  if (!queue) return;
  queue.clear();
  interaction.message.delete().catch((e) => {});
  return;
};
