const { EmbedBuilder } = require("discord.js");

module.exports.data = {
	name: "userinfo",
	description: "Xem thông tin người dùng của ai đó",
	type: 1, // slash command
	options: [
		{
			name: "user",
			description: "Chọn người dùng để xem thông tin",
			type: 6,
			required: false,
		},
	],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	const user = interaction.options.getUser("user") || interaction.user;
	const member = interaction.guild.members.cache.get(user.id);
	if (!member) return interaction.reply(lang?.UserInfo?.NotServerMember);
	const getFieldValue = (name, value) => ({ name, value, inline: true });

	const embed = new EmbedBuilder()
		.setColor(lang?.color || "Random")
		.setTitle(lang?.UserInfo?.Title)
		.setThumbnail(member.user.displayAvatarURL())
		.addFields([
			getFieldValue(lang?.UserInfo?.Username, member.user.username),
			getFieldValue(lang?.UserInfo?.UserID, user.id),
			{
				name: lang?.UserInfo?.JoinedAt,
				value: member ? `<t:${Math.floor(member.joinedAt / 1000)}:F>` : lang?.UserInfo?.NotServerMember,
				inline: true,
			},
			getFieldValue(lang?.UserInfo?.UserJoined, `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`),
		])
		.setTimestamp()
		.setFooter({
			iconURL: interaction.user.displayAvatarURL(),
			text: `${lang?.until?.requestBy} ${interaction.user.username}`,
		});

	await interaction.reply({ embeds: [embed] });
};
