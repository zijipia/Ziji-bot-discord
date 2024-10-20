const { useQueue } = require("discord-player");
const { useFunctions, useDB } = require("@zibot/zihooks");

module.exports.data = {
	name: "volume",
	description: "Chỉnh sửa âm lượng nhạc",
	type: 1, // slash commad
	options: [
		{
			name: "vol",
			description: "Nhập âm lượng",
			required: true,
			type: 4,
			min_value: 0,
			max_value: 100,
		},
	],
	integration_types: [0],
	contexts: [0],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import ('../../lang/vi.js') } lang
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply({ fetchReply: true });
	const volume = interaction.options.getInteger("vol");
	const queue = useQueue(interaction.guild.id);
	if (!queue) return interaction.editReply({ content: lang.music.NoPlaying });
	queue.node.setVolume(Math.floor(volume));
	await interaction.deleteReply().catch((e) => {});
	const DataBase = useDB();
	if (DataBase) {
		await DataBase.ZiUser.updateOne({ userID: interaction.user.id }, { $set: { volume: volume }, $upsert: true });
	}
	const player = useFunctions().get("player_func");
	if (!player) return;
	const res = await player.execute({ queue });
	return queue.metadata.mess.edit(res);
};
