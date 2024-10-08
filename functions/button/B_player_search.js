const { useMainPlayer, useQueue } = require("discord-player");
const { ModalBuilder, TextInputBuilder, TextInputStyle, ButtonInteraction, ActionRowBuilder } = require("discord.js");
const player = useMainPlayer();
module.exports.data = {
	name: "B_player_search",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	const queue = useQueue(interaction.guild.id);

	if (!queue) return interaction.reply({ content: lang.music.NoPlaying, ephemeral: true });

	// Kiểm tra xem người dùng có ở cùng voice channel với bot không
	const botVoiceChannel = interaction.guild.members.me.voice.channel;
	const userVoiceChannel = interaction.member.voice.channel;
	if (!botVoiceChannel || botVoiceChannel.id !== userVoiceChannel?.id)
		return interaction.reply({ content: lang.music.NOvoiceMe, ephemeral: true });

	const modal = new ModalBuilder()
		.setTitle("Search")
		.setCustomId("M_player_search")
		.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder().setCustomId("search-input").setLabel("Search for a song").setStyle(TextInputStyle.Short),
			),
		);
	await interaction.showModal(modal);
	return;
};
