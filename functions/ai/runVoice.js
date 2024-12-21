const { useMainPlayer } = require("discord-player");
const player = useMainPlayer();

module.exports.data = {
	name: "runVoiceAI",
	type: "ai",
};

let voiceAI = false; // Đặt mặc định là `false`

module.exports.execute = async (interaction) => {
	try {
		// Kiểm tra xem người dùng có ở trong voice channel hay không
		const voiceChannel = interaction.member?.voice.channel;
		if (!voiceChannel) {
			return await interaction.editReply('❌ You need to be in a voice channel to activate AI assistant!');
		}

		// Tham gia voice channel
		await player.voiceUtils.join(voiceChannel, {
			deaf: false,
		});

		// Cập nhật trạng thái voiceAI
		voiceAI = true;

		await interaction.editReply('✅ Successfully activated AI assistant!');
	} catch (error) {
		console.error('Error while joining the voice channel:', error);
		await interaction.editReply('❌ Failed to activate AI assistant. Please try again.');
	}
};

module.exports.checkStatus = () => {
	// Trả về trạng thái hiện tại của voiceAI
	return voiceAI;
};
