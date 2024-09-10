const { CommandInteraction, PermissionsBitField } = require('discord.js');

module.exports.data = {
  name: 'ga-end',
  description: 'Kết thúc một giveaway',
  type: 1,
  options: [
    {
      name: 'message',
      description: 'ID tin nhắn của giveaway',
      type: 3,
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

/**
 *
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) &&
    interaction.user.id !== interaction.client.user.id
  ) {
    return interaction.reply({ content: lang?.until?.notHavePremission, ephemeral: true });
  }

  const messageId = interaction.options.getString('message');
  await interaction.client.giveaway.end(messageId);
  return interaction.reply({ content: lang?.until?.success, ephemeral: true });
};
