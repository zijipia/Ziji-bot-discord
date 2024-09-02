const { ButtonInteraction } = require('discord.js');

module.exports.data = {
  name: 'cancel',
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
  interaction.message.delete().catch(e => {});
  return;
};
