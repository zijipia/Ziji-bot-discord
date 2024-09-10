const { CommandInteraction, PermissionsBitField } = require('discord.js');
module.exports.data = {
  name: 'ga-reroll',
  description: 'Reroll một giveaway',
  type: 1, // slash command
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
  await interaction.client.giveaway.reroll(messageId, {
    messages: {
      congrat: lang?.Giveaways?.winMessage,
      error: lang?.Giveaways?.noWinner,
    },
  });
  return interaction.reply({ content: lang?.until?.success, ephemeral: true });
};
