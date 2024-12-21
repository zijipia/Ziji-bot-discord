const { useMainPlayer } = require("discord-player");
const player = useMainPlayer();
const { useZiVoiceExtractor } = require("@zibot/ziextractor");

module.exports.data = {
	name: "runVoiceAI",
	type: "ai",
};

let voiceAI = false; // Đặt mặc định là `false`

module.exports.execute = async (interaction, lang, options = { query: null }) => {
	try {
		const { client, guild, user } = interaction;

		const voiceChannel = interaction.member?.voice.channel;
		if (!voiceChannel) {
			return interaction.reply({
				content: lang?.music?.NOvoiceChannel ?? "Bạn chưa tham gia vào kênh thoại",
				ephemeral: true,
			});
		}

		const voiceMe = guild.members.cache.get(client.user.id).voice.channel;
		if (voiceMe && voiceMe.id !== voiceChannel.id) {
			return interaction.reply({
				content: lang?.music?.NOvoiceMe ?? "Bot đã tham gia một kênh thoại khác",
				ephemeral: true,
			});
		}

		const permissions = voiceChannel.permissionsFor(client.user);
		if (!permissions.has("Connect") || !permissions.has("Speak")) {
			return interaction.reply({
				content: lang?.music?.NoPermission ?? "Bot không có quyền tham gia hoặc nói trong kênh thoại này",
				ephemeral: true,
			});
		}

		// Tham gia voice channel
		const connection = await player.voiceUtils.join(voiceChannel, {
			deaf: false,
		});
		const ziVoice = useZiVoiceExtractor();

		if (!voiceAI) {
			const speechOptions = {
				ignoreBots: true,
				minimalVoiceMessageDuration: 1,
				lang: lang?.local_names || "vi-VN",
			};

			ziVoice.handleSpeakingEvent(client, connection, speechOptions);
		}

		if (options?.query) {
			ziVoice.emit("voiceCreate", {
				content: options.query,
				user,
				channel: voiceChannel,
				client,
			});
		}

		// Cập nhật trạng thái voiceAI
		voiceAI = true;

		await interaction.editReply("✅ Successfully activated AI assistant!");
	} catch (error) {
		console.error("Error while joining the voice channel:", error);
		await interaction.editReply("❌ Failed to activate AI assistant. Please try again.");
	}
};

module.exports.checkStatus = () => {
	// Trả về trạng thái hiện tại của voiceAI
	return voiceAI;
};
