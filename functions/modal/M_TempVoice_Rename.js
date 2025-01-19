const { useDB, useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "M_TempVoice_Rename",
	type: "modal",
};

/**
 * @param { object } modal - object modal
 * @param { import ("discord.js").ModalSubmitInteraction } modal.interaction - modal interaction
 * @param { import('../../lang/vi.js') } modal.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply();
	const config = await useDB().ZiGuild.findOne({ guildId: interaction.guild.id });
	if (!config?.joinToCreate.enabled) return interaction.editReply("❌ | Chức năng này chưa được bật ở máy chủ này");
	const tempChannel = await config.joinToCreate.tempChannels.find((tc) => tc.channelId === interaction.channel.id);
	if (!tempChannel) return;
	const channel = interaction.guild.channels.cache.get(tempChannel.channelId);
	if (!channel) return;
	const { fields } = interaction;
	// Lấy thông tin từ modal
	const newName = fields.getTextInputValue("newChannelName");
	await channel.setName(newName);
	await interaction.editReply({ content: `✅ | Kênh thoại đã đổi tên thành \`${newName}\``, ephemeral: true });
};
