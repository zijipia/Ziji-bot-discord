const { useMainPlayer, useQueue } = require('discord-player');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ButtonInteraction, ActionRowBuilder } = require('discord.js');
const player = useMainPlayer();
module.exports.data = {
  name: 'B_Lyrics_cancel',
  type: 'button',
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
  await interaction.deferUpdate();
  const queue = useQueue(interaction.guild.id);

  if (!queue) {
    await interaction.message.delete().catch(() => {});
    return;
  }
  const ZiLyrics = queue.metadata.ZiLyrics;
  ZiLyrics?.unsubscribe();
  ZiLyrics.mess.delete().catch(() => {});
  ZiLyrics.Active = false;
  return;
};
