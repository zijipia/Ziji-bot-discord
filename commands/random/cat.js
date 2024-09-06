// const { User } = require("discord.js");
const { CommandInteraction } = require('discord.js');

module.exports.data = {
  name: 'cat',
  description: 'Random ảnh mèo',
  type: 1, // slash command
  options: [],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
/**
 *
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  await interaction.deferReply();
  const response = await fetch('https://api.thecatapi.com/v1/images/search');
  const data = await response.json();
  console.log(data);
  await interaction.editReply({ files: [data[0].url] });
};
