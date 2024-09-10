const { ButtonInteraction } = require('discord.js');

module.exports.data = {
  name: 'cancel',
  type: 'button',
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
  interaction.message.delete().catch(e => {});
  return;
};
