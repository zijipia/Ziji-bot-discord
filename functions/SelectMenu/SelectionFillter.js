const { useQueue } = require('discord-player');
const { StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports.data = {
  name: 'player_SelectionFillter',
  type: 'SelectMenu',
};

/**
 * @param { StringSelectMenuInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  if (interaction.message.interaction.user.id !== interaction.user.id) {
    return interaction.reply({ content: 'You cannot interact with this menu.', ephemeral: true });
  }
  const { guild, client, values } = interaction;
  const queue = useQueue(interaction.guild.id);
  const fillter = values?.at(0);
  const Fillter = client.functions.get('Fillter');
  const player = client.functions.get('player_func');
  await interaction?.deferUpdate().catch(e => {});
  await Fillter.execute(interaction, fillter);
  queue.metadata.mess.edit(await player.execute(client, queue));
  return;
};
