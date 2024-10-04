const { useQueue } = require('discord-player');
const { StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports.data = {
  name: 'player_SelectionFillter',
  type: 'SelectMenu',
};

/**
 * @param { object } selectmenu - object selectmenu
 * @param { StringSelectMenuInteraction } selectmenu.interaction - selectmenu interaction
 * @param { import('../../lang/vi.js') } selectmenu.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
  const { guild, client, user, values } = interaction;
  const queue = useQueue(interaction.guild.id);
  if (queue.metadata.requestedBy?.id !== user.id) {
    return interaction.reply({ content: 'You cannot interact with this menu.', ephemeral: true });
  }
  const fillter = values?.at(0);
  const Fillter = client.functions.get('Fillter');
  const player = client.functions.get('player_func');
  await interaction?.deferUpdate().catch((e) => {});
  await Fillter.execute(interaction, fillter);
  queue.metadata.mess.edit(await player.execute(client, queue));
  return;
};
