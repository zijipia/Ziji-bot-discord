const { CommandInteraction, PermissionsBitField } = require('discord.js');

module.exports.data = {
  name: 'ban',
  description: 'Cấm một người dùng khỏi máy chủ',
  type: 1, // slash command
  options: [
    {
      name: 'user',
      description: 'Người dùng cần cấm',
      type: 6, // user
      required: true,
    },
    {
      name: 'reason',
      description: 'Lý do cấm',
      type: 3, // string
      required: false,
    },
  ],
  integration_types: [0],
  contexts: [0],
  default_member_permissions: '0',
};

/**
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'Không có lý do';

  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers) &&
    user.id !== interaction.client.user.id
  ) {
    return interaction.reply({ content: 'Bạn không có quyền cấm thành viên.', ephemeral: true });
  }

  const member = interaction.guild.members.cache.get(user.id);
  if (!member) {
    return interaction.reply({ content: 'Không tìm thấy người dùng.', ephemeral: true });
  }

  try {
    await user.send(`Bạn đã bị cấm khỏi ${interaction.guild.name} vì: ${reason}`);
  } catch (error) {
    console.error(`Không thể gửi tin nhắn trực tiếp cho ${user.tag}:`, error);
  }

  await member.ban({ reason });
  interaction.reply({ content: `Đã cấm ${user.tag} vì: ${reason}` });
};
