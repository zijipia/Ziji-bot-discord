const { CommandInteraction, Routes, EmbedBuilder } = require('discord.js');
const ZiIcons = require('../../utility/icon');

module.exports.data = {
  name: 'help',
  description: 'Help',
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
  const commands = await interaction.client.rest.get(Routes.applicationCommands(interaction.client.user.id));
  const guildCommands = commands.filter(cmd => cmd.type === 1 || cmd.type === 2);
  const contextCommands = commands.filter(cmd => cmd.type === 3);
  const playerButtons = [
    {
      name: lang?.playerButtons?.Refresh || 'Làm mới',
      id: 'player_refresh',
      description: lang?.playerFunc?.Fields?.Refresh || 'Làm mới trình phát nhạc',
      icon: ZiIcons.refesh,
    },
    {
      name: lang?.playerButtons?.Previous || 'Bài trước',
      id: 'player_previous',
      description: lang?.playerFunc?.Fields?.Previous || 'Phát bài hát trước đó',
      icon: ZiIcons.prev,
    },
    {
      name: lang?.playerButtons?.PausePlay || 'Tạm dừng/Phát',
      id: 'player_pause',
      description: lang?.playerFunc?.Fields?.PausePlay || 'Tạm dừng hoặc tiếp tục phát nhạc',
      icon: ZiIcons.pause,
    },
    {
      name: lang?.playerButtons?.Next || 'Bài tiếp',
      id: 'player_next',
      description: lang?.playerFunc?.Fields?.Next || 'Phát bài hát tiếp theo',
      icon: ZiIcons.next,
    },
    {
      name: lang?.playerButtons?.Stop || 'Dừng',
      id: 'player_stop',
      description: lang?.playerFunc?.Fields?.Stop || 'Dừng phát nhạc và xóa hàng đợi',
      icon: ZiIcons.stop,
    },
    {
      name: lang?.playerButtons?.Search || 'Tìm kiếm',
      id: 'player_search',
      description: lang?.playerFunc?.Fields?.Search || 'Tìm kiếm bài hát',
      icon: ZiIcons.search,
    },
    {
      name: lang?.playerButtons?.AutoPlay || 'Tự động phát',
      id: 'player_autoPlay',
      description: lang?.playerFunc?.Fields?.AutoPlay || 'Bật/tắt chế độ tự động phát',
      icon: ZiIcons.loopA,
    },
    {
      name: lang?.playerButtons?.SelectTrack || 'Chọn bài hát',
      id: 'player_SelectionTrack',
      description: lang?.playerFunc?.RowRel || 'Chọn bài hát từ danh sách đề xuất',
      icon: ZiIcons.Playbutton,
    },
    {
      name: lang?.playerButtons?.SelectFunc || 'Chức năng',
      id: 'player_SelectionFunc',
      description: lang?.playerFunc?.RowFunc || 'Chọn các chức năng khác của trình phát',
      icon: ZiIcons.fillter,
    },
  ];

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.client.user.username} Help:`,
      iconURL: interaction.client.user.displayAvatarURL({ size: 1024 }),
    })
    //</NAME:COMMAND_ID>
    .setDescription(
      `# Guild Commands:\n**${guildCommands.map(cmd => `</${cmd.name}:${cmd.id}>: ${cmd.description}`).join('\n')}**` +
        `\n# Context Commands:\n**${contextCommands.map(cmd => `${cmd.name}`).join('\n')}**` +
        `\n# Player Buttons:\n**${playerButtons.map(btn => `${btn.icon} ${btn.name}: ${btn.description}`).join('\n')}**`
    )
    .setColor('Random')
    .setFooter({
      text: `${lang.until.requestBy} ${interaction.user?.username}`,
      iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
    })
    .setTimestamp();
  await interaction.editReply({
    embeds: [embed],
  });
};
