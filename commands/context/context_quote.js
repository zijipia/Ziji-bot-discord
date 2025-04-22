const { MiQ } = require("makeitaquote");

module.exports.data = {
	name: "Quote Image Generation",
	type: 3, // context
	options: [],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
/**
 * @param { object } context - object command
 * @param { import ("discord.js").MessageContextMenuCommandInteraction } context.interaction - interaction
 * @param { import('../../lang/vi.js') } context.lang - language
 */
module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply();
	let msg = interaction.targetMessage;

	if (msg.content) {
		const miq = new MiQ()
			.setText(msg.content)
			.setColor(true)
			.setDisplayname(msg.author.displayName)
			.setUsername(msg.author.username)
			.setAvatar(msg.author.displayAvatarURL({ size: 1024 }))
			.setWatermark(interaction.client.user.tag);
		const result = await miq.generate();
		await interaction.editReply(result);
		return;
	}
};
