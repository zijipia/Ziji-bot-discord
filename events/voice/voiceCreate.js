const { useMainPlayer, useQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const Functions = useFunctions();
const googleTTS = require("google-tts-api");
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	NoSubscriberBehavior,
	getVoiceConnection,
	AudioPlayerStatus,
} = require("discord-voip");

async function Update_Player(queue) {
	const player = Functions.get("player_func");
	if (!player) return;
	const res = await player.execute({ queue });
	queue.metadata.mess.edit(res);
}
module.exports = {
	name: "voiceCreate",
	type: "voiceExtractor",
	execute: async ({ content, user, channel, client }) => {
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
		console.log(aifunc);
		if (aifunc.checkStatus) {
			const result = await player.client.run(
				`Answer up to 150 characters for this question: ${lowerContent}\nRequested by: ${user.username}`,
			);
			const urlSong = googleTTS.getAudioUrl(result, {
				lang: queue?.metadata?.lang?.local_names || "vi",
				slow: false,
				host: "https://translate.google.com",
			});
			{
				let resource = createAudioResource(urlSong, {
					inlineVolume: true,
				});
				resource.volume.setVolume(0.5);

				let players = createAudioPlayer({
					behaviors: {
						noSubscriber: NoSubscriberBehavior.Play,
					},
				});
				const connection = player.voiceUtils.getConnection(channel.guild.id);

				console.log(connection);
				connection.subscribe(players);
				players.play(resource);

				// await player.play(channel, resource, {
				// 	audioPlayerOptions: {
				// 		queue: false,
				// 	},
				// });
			}
		}
	},
};
