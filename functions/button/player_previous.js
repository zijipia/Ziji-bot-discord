const { useMainPlayer, useQueue, useHistory } = require('discord-player');
const { ButtonInteraction } = require('discord.js');
const player = useMainPlayer();
module.exports.data = {
  name: 'player_previous',
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
  const history = useHistory(interaction.guild.id);
  history.previous();
  return;
};
