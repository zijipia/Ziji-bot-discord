const { useMainPlayer } = require("discord-player");
const player = useMainPlayer();
module.exports.data = {
	name: "runVoiceAI",
	type: "ai",
};

module.exports.execute = async (interaction) => {
	let voiceAI = true
	const voiceChannel = interaction.member?.voice.channel;
	if (voiceChannel) {
		player.voiceUtils.join(voiceChannel, {
			deaf: true
		})
		// player({
		// 	channelId: voiceChannel.id,
		// 	guildId: voiceChannel.guild.id,
		// 	adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		// 	selfDeaf: false,
		// });
	};
	await interaction.editReply('Sucessfully activated AI assistant!')
};

module.exports.checkStatus = (status) => {
	if (status == true) return true;
	else return false
}