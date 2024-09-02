const { CommandInteraction, PermissionsBitField } = require('discord.js');

module.exports.data = {
  name: 'timeout',
  description: 'Tạm thời cấm một người dùng trong một khoảng thời gian nhất định',
  type: 1, // slash command
  options: [
    {
      name: 'user',
      description: 'Người dùng cần tạm thời cấm',
      type: 6, // user
      required: true,
    },
    {
      name: 'duration',
      description: 'Thời gian tạm thời cấm (ví dụ: 45s, 30m, 1h, 2d)',
      type: 3, // string
      required: true,
    },
    {
      name: 'reason',
      description: 'Lý do tạm thời cấm',
      type: 3, // string
      required: false,
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
  const durationInput = interaction.options.getString('duration');
  const reason = interaction.options.getString('reason') || 'Không có lý do';

  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers) &&
    user.id !== interaction.client.user.id
  ) {
    return interaction.reply({ content: 'Bạn không có quyền tạm thời cấm thành viên.', ephemeral: true });
  }

  const member = interaction.guild.members.cache.get(user.id);
  if (!member) {
    return interaction.reply({ content: 'Không tìm thấy người dùng.', ephemeral: true });
  }

  const durationRegex = /^(\d+)([hmsd])$/;
  const match = durationInput.match(durationRegex);

  if (!match) {
    return interaction.reply({
      content: 'Định dạng thời gian không hợp lệ. Sử dụng s cho giây, m cho phút, h cho giờ, và d cho ngày.',
      ephemeral: true,
    });
  }

  const value = parseInt(match[1]);
  const unit = match[2];
  let duration;

  switch (unit) {
    case 'h':
      duration = value * 60 * 60 * 1000;
      break;
    case 'm':
      duration = value * 60 * 1000;
      break;
    case 's':
      duration = value * 1000;
      break;
    case 'd':
      duration = value * 24 * 60 * 60 * 1000;
      break;
    default:
      return interaction.reply({ content: 'Đơn vị thời gian không hợp lệ.', ephemeral: true });
  }

  await member.timeout(duration, reason);
  interaction.reply({ content: `Đã tạm thời cấm ${user.tag} trong ${durationInput} vì: ${reason}` });

  try {
    await user.send(`Bạn đã bị tạm thời cấm khỏi ${interaction.guild.name} trong ${durationInput} vì: ${reason}`);
  } catch (error) {
    console.error(`Không thể gửi tin nhắn trực tiếp cho ${user.tag}:`, error);
  }
};
