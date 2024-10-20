const { useQueue } = require("discord-player");

module.exports.data = {
	name: "disconnect",
	description: "Tắt nhạc và rời khỏi kênh thoại",
	type: 1, // slash commad
	options: [],
	integration_types: [0],
	contexts: [0],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } lang
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply();
	const queue = useQueue(interaction.guild.id);
	if (!queue) {
		await interaction?.guild?.members?.me?.voice?.disconnect();
		await interaction.editReply(lang.music.Disconnect);
		return;
	}
	if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id) return;
	await queue?.metadata?.mess?.edit({ components: [] }).catch((e) => {});
	queue.delete();
	await interaction.editReply(lang.music.DisconnectDes);
};
