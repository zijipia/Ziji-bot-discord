const { StringSelectMenuInteraction } = require('discord.js');

module.exports.data = {
  name: 'player_SelectionTrack',
  type: 'SelectMenu',
};

/**
 * @param { object } selectmenu - object selectmenu
 * @param { StringSelectMenuInteraction } selectmenu.interaction - selectmenu interaction
 * @param { import('../../lang/vi.js') } selectmenu.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
  // track Selec from text search command | search modal | search context | etc...
  const query = interaction.values?.at(0);
  if (query === 'cancel') return interaction.message.delete().catch(e => {});
  const command = interaction.client.functions.get('Search');
  await command.execute(interaction, query, lang);
  return;
};
