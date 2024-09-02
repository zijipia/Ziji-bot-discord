const { useMainPlayer, useQueue } = require('discord-player');
const { ButtonInteraction } = require('discord.js');
module.exports.data = {
  name: 'player_pause',
  type: 'button',
};
/**
 *
 * @param { ButtonInteraction } interaction
 * @returns
 */
module.exports.execute = async (interaction, lang) => {
  if (interaction.message.interaction.user.id !== interaction.user.id) {
    return interaction.reply({ content: 'You cannot interact with this button.', ephemeral: true });
  }
  interaction.deferUpdate();
  const queue = useQueue(interaction.guild.id);
  if (!queue) return;
  if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id) return;
  queue.node.setPaused(queue.node.isPlaying());

  const player = interaction.client.functions.get('player_func');

  if (!player) return;
  const res = await player.execute(interaction.client, queue);
  queue.metadata.mess.edit(res);
};
