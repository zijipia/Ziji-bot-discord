const { CommandInteraction, PermissionsBitField } = require('discord.js');

module.exports.data = {
  name: 'untimeout',
  description: 'Bỏ cấm tạm thời một người dùng',
  type: 1, // slash command
  options: [
    {
      name: 'user',
      description: 'Người dùng cần bỏ cấm tạm thời',
      type: 6, // user
      required: true,
    },
  ],
  integration_types: [0],
  contexts: [0],
};

/**
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  const user = interaction.options.getUser('user');

  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    return interaction.reply({
      content: 'Bạn không có quyền bỏ cấm tạm thời thành viên.',
      ephemeral: true,
    });
  }

  const member = interaction.guild.members.cache.get(user.id);
  if (!member) {
    return interaction.reply({ content: 'Không tìm thấy người dùng.', ephemeral: true });
  }

  try {
    await member.timeout(null);
    interaction.reply({ content: `Đã bỏ cấm tạm thời ${user.tag}` });
  } catch (error) {
    console.error('Lỗi khi bỏ cấm tạm thời:', error);
    interaction.reply({ content: 'Không thể bỏ cấm tạm thời người dùng.', ephemeral: true });
  }
};
