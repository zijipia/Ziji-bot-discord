const { useQueue } = require("discord-player");

module.exports.data = {
	name: "B_queue_clear",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { import ("discord.js").ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	const queue = useQueue(interaction.guild.id);
	if (!queue) return interaction.reply({ content: lang.music.NoPlaying, ephemeral: true });
	// Kiểm tra xem có khóa player không
	if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id)
		return interaction.reply({ content: lang.until.noPermission, ephemeral: true });

	// Kiểm tra xem người dùng có ở cùng voice channel với bot không
	const botVoiceChannel = interaction.guild.members.me.voice.channel;
	const userVoiceChannel = interaction.member.voice.channel;
	if (!botVoiceChannel || botVoiceChannel.id !== userVoiceChannel?.id)
		return interaction.reply({ content: lang.music.NOvoiceMe, ephemeral: true });

	queue.clear();
	interaction.message.delete().catch((e) => {});
	return;
};
