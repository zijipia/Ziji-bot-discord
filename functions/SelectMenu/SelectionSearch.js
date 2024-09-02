const { StringSelectMenuInteraction } = require('discord.js');

module.exports.data = {
  name: 'player_SelectionSearch',
  type: 'SelectMenu',
};
/**
 * @param { StringSelectMenuInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  if (interaction.message.interaction.user.id !== interaction.user.id) {
    return interaction.reply({ content: 'You cannot interact with this menu.', ephemeral: true });
  }
  const query = interaction.values?.at(0);
  if (query === 'cancel') return interaction.message.delete().catch(e => {});
  const command = interaction.client.functions.get('Search');
  await command.execute(interaction, query, lang);
  return;
};
