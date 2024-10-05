const { useMainPlayer, useQueue } = require('discord-player');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ButtonInteraction, ActionRowBuilder } = require('discord.js');
const player = useMainPlayer();
module.exports.data = {
  name: 'B_player_search',
  type: 'button',
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
  const modal = new ModalBuilder()
    .setTitle('Search')
    .setCustomId('modal_search')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('search-input').setLabel('Search for a song').setStyle(TextInputStyle.Short),
      ),
    );
  await interaction.showModal(modal);
  return;
};
