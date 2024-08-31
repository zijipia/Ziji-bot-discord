const { CommandInteraction } = require('discord.js');
const config = require('../../config');

module.exports.data = {
  name: 'shutdown',
  description: 'Dừng bot',
  type: 1, // slash command
  integration_types: [0],
  contexts: [0],
  owner: true,
};

/**
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async interaction => {
  if (interaction.user.id !== config.OwnerID) return;
  await interaction.reply({ content: 'Bot đang dừng...', ephemeral: true });
  process.exit(); // Dừng bot
};
