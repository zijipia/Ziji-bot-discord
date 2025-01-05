const { useMainPlayer, useQueue, Track } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const Functions = useFunctions();

async function Update_Player(queue) {
	const player_func = Functions.get("player_func");
	if (!player_func) return;
	const res = await player_func.execute({ queue });
	queue.metadata.mess.edit(res);
}

const promptBuilder = (content, player, user, queue) => {
	const old_context = queue?.history?.previousTrack;
	const lowerContent = content?.toLowerCase()?.trim();
	const language = queue?.metadata?.lang?.local_names;

	const old_Prompt = `${
		old_context?.raw?.old_Prompt ??
		`Bạn là một bot Discord https://github.com/zijipia/Ziji-bot-discord\nVới các lệnh slash: avatar: Xem ảnh đại diện của ai đó\nhelp: Help\nlanguage: Chỉnh sửa ngôn ngữ bot\nping: Check the bot's ping\ntranslate: Translate any language\ndisconnect: Tắt nhạc và rời khỏi kênh thoại\nuserinfo: Xem thông tin người dùng của ai đó\nban: Cấm một người dùng khỏi máy chủ\npurge: Xóa một số lượng tin nhắn từ một kênh\nvolume: Chỉnh sửa âm lượng nhạc\ncat: Random ảnh mèo\ndog: Random ảnh chó\nweather: Kiểm tra thời tiết\nkick: Đuổi một người dùng khỏi máy chủ\ntimeout: Tạm thời cấm một người dùng trong một khoảng thời gian nhất định\nunban: Bỏ cấm một người dùng khỏi máy chủ\nuntimeout: Bỏ cấm tạm thời một người dùng\nlyrics: Lời bài hát\nanime: Get anime information.\nstatistics: View information about the system.\nplay next: Thêm nhạc và tiếp theo\nplay assistant: Thêm nhạc và điều khiển bằng giọng nói\nplay music: Phát nhạc\nplayer: Gọi Player\nautoresponder new: Tạo một autoresponder mới\nautoresponder edit: Sửa đổi một autoresponder có sẵn\nwelcomer setup: Setup chào mừng thành viên\nai ask: Hỏi AI\nai assistant: Kích hoạt AI trong phòng voice\ndecrypt: Decrypts an encrypted string back into an another\nencrypt: Encrypts another into a string\nvariable: View the bot's variable\ntts: Thay mặt bạn nói điều gì đó\nvoice log: Thông báo người tham gia kênh thoại\n`
	}\n${user.username}: ${old_context?.title} \n${player.client.user.username}: ${old_context?.raw?.["full context"]}`;

	const userPrompt = lowerContent ? `${user.username} có câu hỏi: ${lowerContent}` : "How can I assist you today?";
	return {
		Prompt:
			language === "vi_VN" ?
				`Context:\n${old_Prompt}\nPrompt: ${userPrompt}, Hãy trả lời bằng tiếng Việt.`
			:	`Context:\n${old_Prompt}\nPrompt: ${userPrompt}, Please respond in ${language}.`,
		old_Prompt,
	};
};

module.exports = {
	name: "voiceCreate",
	type: "voiceExtractor",
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
			const res = promptBuilder(lowerContent, player, user, queue);
			const result = await player.client.run(res.Prompt);

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
