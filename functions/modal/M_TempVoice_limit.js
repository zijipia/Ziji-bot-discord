const { useDB, useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "M_TempVoice_limit",
	type: "modal",
};

/**
 * @param { object } modal - object modal
 * @param { import ("discord.js").ModalSubmitInteraction } modal.interaction - modal interaction
 * @param { import('../../lang/vi.js') } modal.lang - language
 */

let limit = 0;
module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply();
	const config = await useDB().ZiGuild.findOne({ guildId: interaction.guild.id });
	if (!config?.joinToCreate.enabled) return interaction.editReply("❌ | Chức năng này chưa được bật ở máy chủ này");
	const tempChannel = await config.joinToCreate.tempChannels.find((tc) => tc.channelId === interaction.channel.id);
	if (!tempChannel) return;
	const channel = interaction.guild.channels.cache.get(tempChannel.channelId);
	if (!channel) return;
	limit = parseInt(interaction.fields.getTextInputValue("userLimit"));
	if (isNaN(limit) || limit < 0 || limit > 99)
		return interaction.editReply({
			content: "❌ | Bạn cần cung cấp một số lớn hơn 0 và nhỏ hơn 99",
			ephemeral: true,
		});
	await channel.setUserLimit(limit);
	await interaction.editReply({ content: `✅ | Đã chỉnh giới hạn người dùng thành ${limit} người.`, ephemeral: true });
};
