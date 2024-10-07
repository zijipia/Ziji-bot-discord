const { CommandInteraction, EmbedBuilder } = require("discord.js");

const config = require("../../config");

module.exports.data = {
	name: "ping",
	description: "Check the bot's ping",
	type: 1, // slash command
	options: [],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

/**
 * @param { object } command - object command
 * @param { CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	try {
		const initialResponse = await interaction.reply({ content: "🏓 Pinging...", fetchReply: true });

		const roundTripLatency = initialResponse.createdTimestamp - interaction.createdTimestamp;
		const botPing = interaction.client.ws.ping;

		const latencyStatus =
			botPing > 200 ? lang?.Ping?.Poor || " "
			: botPing > 100 ? lang?.Ping?.Good || " "
			: lang?.Ping?.Excellent || " ";

		const informationEmbed = new EmbedBuilder()
			.setTitle("🏓 Pong!")
			.setColor("Random")
			.setDescription(lang.Ping?.Description?.replace("##username##", interaction.user) || " ")
			.addFields(
				{ name: lang?.Ping?.Roundtrip || " ", value: `${roundTripLatency}ms`, inline: true },
				{ name: lang?.Ping?.Websocket || " ", value: `${botPing}ms`, inline: true },
				{ name: lang?.Ping?.Latency || " ", value: latencyStatus, inline: true },
				{
					name: lang?.Ping?.Timestamp || " ",
					value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
					inline: true,
				},
			)
			.setImage(config.botConfig?.Banner || null)
			.setThumbnail(interaction.client.user.displayAvatarURL({ size: 1024, dynamic: true }))
			.setTimestamp()
			.setFooter({
				text: `${lang.until.requestBy} ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
			});

		await interaction.editReply({ content: null, embeds: [informationEmbed] });
	} catch (error) {
		console.error("Error executing ping command:", error);
		await interaction.followUp({
			content: "❌ There was an error executing the ping command.",
			ephemeral: true,
		});
	}
};
