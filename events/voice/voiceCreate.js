const { useMainPlayer, useQueue, Track } = require("discord-player");
const { useFunctions, useAI } = require("@zibot/zihooks");
const Functions = useFunctions();

async function Update_Player(queue) {
	const player_func = Functions.get("player_func");
	if (!player_func) return;
	const res = await player_func.execute({ queue });
	queue.metadata.mess.edit(res);
}

module.exports = {
	name: "voiceCreate",
	type: "voiceExtractor",
	enable: false, //v7 not support

	/**
	 *
	 * @param { object } param0 - voice Create event
	 * @param { import ("discord.js").User } param0.user - user who created the voice channel
	 */
	execute: async ({ content, user, channel }) => {
		const player = useMainPlayer();
		const lowerContent = content.toLowerCase();
		console.log(lowerContent);
		const queue = useQueue(channel.guild);

		const commands = {
			"skip|bỏ qua|next": () => {
				queue.node.skip();
				console.log("Đã bỏ qua bài hát hiện tại");
			},
			"volume|âm lượng": () => {
				const volumeMatch = lowerContent.match(/\d+/);
				if (volumeMatch) {
					const newVolume = parseInt(volumeMatch[0]);
					if (newVolume >= 0 && newVolume <= 100) {
						queue.node.setVolume(newVolume);
						console.log(`Đã đặt âm lượng thành ${newVolume}%`);
					} else {
						console.log("Âm lượng phải nằm trong khoảng từ 0 đến 100");
					}
				} else {
					console.log("Không tìm thấy giá trị âm lượng hợp lệ trong lệnh");
				}
				Update_Player(queue);
			},
			"pause|tạm dừng": () => {
				queue.node.pause();
				Update_Player(queue);
				console.log("Đã tạm dừng phát nhạc");
			},
			"resume|tiếp tục": () => {
				queue.node.resume();
				Update_Player(queue);
				console.log("Đã tiếp tục phát nhạc");
			},
			"disconnect|ngắt kết nối": () => {
				queue.delete();
				console.log("Đã ngắt kết nối");
			},
			"auto play|tự động phát": async () => {
				queue.setRepeatMode(queue.repeatMode === 3 ? 0 : 3);
				if (queue.isPlaying()) return Update_Player(queue);
				const B_player_autoPlay = Functions.get("B_player_autoPlay");
				const tracks = await B_player_autoPlay.getRelatedTracks(queue?.history?.previousTrack, queue?.history);
				if (!tracks?.at(0)?.url.length) return;
				const searchCommand = Functions.get("Search");
				await searchCommand.execute(null, tracks?.at(0)?.url, queue?.metadata?.lang);
			},
			"play|tìm|phát|hát": async () => {
				const query = lowerContent.replace(/play|tìm|phát|hát/g, "").trim();
				await player.play(channel, query);
			},
		};

		for (const [pattern, action] of Object.entries(commands)) {
			if (lowerContent.match(new RegExp(pattern))) {
				if (!queue) continue;
				await action();
				return;
			}
		}

		const aifunc = await Functions.get("runVoiceAI");
		if (aifunc.checkStatus) {
			const result = await useAI().run(lowerContent, user);

			const tts = await Functions.get("TextToSpeech");
			await tts.execute(
				{
					client: player.client,
					guild: channel.guild,
					user,
				},
				result,
				queue?.metadata?.lang,
				{ queue, title: lowerContent, voice: channel, old_Prompt: res.old_Prompt },
			);
		}
	},
};
