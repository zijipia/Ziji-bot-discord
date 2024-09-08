const { CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports.data = {
  name: 'ping',
  description: "Check the bot's ping",
  type: 1, // slash command
  options: [],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
/**
 *
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async interaction => {
  const ping = interaction.client.ws.ping;
  interaction.reply(`Ping: ${ping}`);
  return;
};
