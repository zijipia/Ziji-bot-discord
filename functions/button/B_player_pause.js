const { useQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "B_player_pause",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { import ("discord.js").ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferUpdate();
	const queue = useQueue(interaction.guild.id);
	if (!queue) return interaction.followUp({ content: lang.music.NoPlaying, ephemeral: true });

	// Kiểm tra xem có khóa player không
	if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id)
		return interaction.followUp({ content: lang.until.noPermission, ephemeral: true });

	// Kiểm tra xem người dùng có ở cùng voice channel với bot không
	const botVoiceChannel = interaction.guild.members.me.voice.channel;
	const userVoiceChannel = interaction.member.voice.channel;
	if (!botVoiceChannel || botVoiceChannel.id !== userVoiceChannel?.id)
		return interaction.followUp({ content: lang.music.NOvoiceMe, ephemeral: true });

	queue.node.setPaused(queue.node.isPlaying());

	const player = useFunctions().get("player_func");

	if (!player) return;
	const res = await player.execute({ queue });
	queue.metadata.mess.edit(res);
};
