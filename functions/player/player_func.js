const { useMainPlayer, QueryType, GuildQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const config = require("@zibot/zihooks").useConfig();
const player = useMainPlayer();
const {
	Client,
	ButtonStyle,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} = require("discord.js");
const ZiIcons = require("../../utility/icon");

const CreateButton = ({ id = null, style = ButtonStyle.Secondary, label = null, emoji = null, disable = true }) => {
	const button = new ButtonBuilder().setCustomId(`B_player_${id}`).setStyle(style).setDisabled(disable);
	if (label) button.setLabel(label);
	if (emoji) button.setEmoji(emoji);
	return button;
};

// Helper function to get related tracks
const getRelatedTracks = async (track, history) => {
	try {
		let tracks = (await track?.extractor?.getRelatedTracks(track, history))?.tracks || [];

		if (!tracks.length) {
			tracks =
				(
					await player.extractors.run(async (ext) => {
						const res = await ext.getRelatedTracks(track, history);
						return res.tracks.length ? res.tracks : false;
					})
				)?.result || [];
		}

		return tracks.filter((tr) => !history.tracks.some((t) => t.url === tr.url));
	} catch (e) {
		console.log(e);
		return [];
	}
};

// Helper function to get query Type Icon
const getQueryTypeIcon = (type, raw) => {
	switch (type) {
		case QueryType.YOUTUBE:
		case QueryType.YOUTUBE_PLAYLIST:
		case QueryType.YOUTUBE_SEARCH:
		case QueryType.YOUTUBE_VIDEO:
		case "ZiPlayer": //voice join
			return ZiIcons.youtubeIconURL;
		case QueryType.SPOTIFY_ALBUM:
		case QueryType.SPOTIFY_PLAYLIST:
		case QueryType.SPOTIFY_SONG:
		case QueryType.SPOTIFY_SEARCH:
			return ZiIcons.spotifyIconURL;
		case QueryType.SOUNDCLOUD:
		case QueryType.SOUNDCLOUD_TRACK:
		case QueryType.SOUNDCLOUD_PLAYLIST:
		case QueryType.SOUNDCLOUD_SEARCH:
			return ZiIcons.soundcloudIconURL;
		default:
			return raw?.favicon ?? ZiIcons.AttachmentIconURL;
	}
};

const repeatMode = ["OFF", `${ZiIcons.loop1} Track`, `${ZiIcons.loopQ} Queue`, `${ZiIcons.loopA} AutoPlay`];

module.exports = {
	data: { name: "player_func", type: "player" },

	/**
	 * @param { Client } client
	 * @param { GuildQueue } queue
	 * @returns
	 */

	execute: async ({ queue, tracks }) => {
		const track = tracks ?? queue?.currentTrack ?? queue?.history?.previousTrack;
		const requestedBy = track?.requestedBy ?? queue.metadata.requestedBy;
		const langfunc = useFunctions().get("ZiRank");
		const lang = await langfunc.execute({ user: requestedBy, XpADD: 0 });
		const queryTypeIcon = getQueryTypeIcon(track?.queryType, track?.raw);
		const timestamps = queue?.node.getTimestamp();
		const trackDurationSymbol = timestamps?.progress === "Infinity" ? "" : "%";
		const trackDuration = timestamps?.progress === "Infinity" ? "∞" : timestamps?.progress;

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${track?.author} - ${track?.title}`.slice(0, 256),
				iconURL: `${queryTypeIcon}`,
				url: track?.url,
			})
			.setDescription(
				`Volume: **${queue.node.volume}** % - Playing: **${trackDuration}${trackDurationSymbol}** - Host: ${queue.metadata.requestedBy} <a:_:${
					ZiIcons.animatedIcons[Math.floor(Math.random() * ZiIcons.animatedIcons.length)]
				}>${config.webAppConfig?.musicControllerUrl ? `\n[Click to launch music controller](${config.webAppConfig.musicControllerUrl})` : ""}`,
			)
			.setColor(lang?.color || "Random")
			.setFooter({
				text: `${lang.until.requestBy} ${requestedBy?.username}`,
				iconURL: requestedBy.displayAvatarURL({ size: 1024 }),
			})
			.setTimestamp();
		if (queryTypeIcon === ZiIcons.youtubeIconURL) {
			embed.setImage(track?.thumbnail);
		} else {
			embed.setThumbnail(track?.thumbnail);
		}

		if (track?.queryType === "tts") {
			embed.setDescription(`* ${player.client.user.username}:\n${track?.raw?.["full context"]}`);
			return { content: "", embeds: [embed], components: [] };
		}
		const code = { content: "" };
		const relatedTracks = await getRelatedTracks(track, queue.history);
		const filteredTracks = relatedTracks.filter((t) => t.url.length < 100).slice(0, 20);

		const trackOptions = filteredTracks.map((track, i) => {
			return new StringSelectMenuOptionBuilder()
				.setLabel(`${i + 1}: ${track.title}`.slice(0, 99))
				.setDescription(`Duration: ${track.duration} source: ${track.queryType}`)
				.setValue(`${track.url}`)
				.setEmoji(`${ZiIcons.Playbutton}`);
		});

		const disableOptions = [
			new StringSelectMenuOptionBuilder()
				.setLabel("No Track")
				.setDescription(`XX:XX`)
				.setValue(`Ziji Bot`)
				.setEmoji(`${ZiIcons.Playbutton}`),
		];

		const relatedTracksRow = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId("S_player_Track")
				.setPlaceholder(lang?.playerFunc?.RowRel ?? "▶ | Select a song to add to the queue")
				.addOptions(trackOptions.length ? trackOptions : disableOptions)
				.setMaxValues(1)
				.setMinValues(1)
				.setDisabled(!trackOptions.length),
		);

		if (queue.node.isPlaying() || queue.node.isPaused() || !queue.isEmpty()) {
			embed.addFields({
				name: " ",
				value: `${queue.node.createProgressBar({ leftChar: "﹏", rightChar: "﹏", indicator: "𓊝" })}`,
			});
			const functions = [
				{
					Label: "Search Tracks",
					Description: lang?.playerFunc?.Fields?.Search || "Tìm kiếm bài hát",
					Value: "Search",
					Emoji: ZiIcons.search,
				},
				{
					Label:
						!queue.metadata.LockStatus ? lang?.playerFunc?.Fields?.Lock || "Lock" : lang?.playerFunc?.Fields?.UnLock || "UnLock",
					Description:
						!queue.metadata.LockStatus ?
							lang?.playerFunc?.Fields?.Lockdes || "Khoá truy cập player"
						:	lang?.playerFunc?.Fields?.Unlockdes || "Mở khoá truy cập player",
					Value: "Lock",
					Emoji: !queue.metadata.LockStatus ? ZiIcons.Lock : ZiIcons.UnLock,
				},
				{
					Label: "Loop",
					Description: lang?.playerFunc?.Fields?.Loop || "Lặp Lại",
					Value: "Loop",
					Emoji: ZiIcons.loop,
				},
				{
					Label: "AutoPlay",
					Description: lang?.playerFunc?.Fields?.AutoPlay || "Tự động phát",
					Value: "AutoPlay",
					Emoji: ZiIcons.loopA,
				},
				{
					Label: "Queue",
					Description: lang?.playerFunc?.Fields?.Queue || "Hàng đợi",
					Value: "Queue",
					Emoji: ZiIcons.queue,
				},
				{
					Label: "Mute",
					Description: lang?.playerFunc?.Fields?.Mute || "Chỉnh âm lượng về 0",
					Value: "Mute",
					Emoji: ZiIcons.mute,
				},
				{
					Label: "Unmute",
					Description: lang?.playerFunc?.Fields?.Unmute || "Mở khoá âm lượng",
					Value: "Unmute",
					Emoji: ZiIcons.volinc,
				},
				{
					Label: "Vol +",
					Description: lang?.playerFunc?.Fields?.VolInc || "Tăng âm lượng",
					Value: "volinc",
					Emoji: ZiIcons.volinc,
				},
				{
					Label: "Vol -",
					Description: lang?.playerFunc?.Fields?.VolDec || "Giảm âm lượng",
					Value: "voldec",
					Emoji: ZiIcons.voldec,
				},
				{
					Label: "Lyrics",
					Description: lang?.playerFunc?.Fields?.Lyrics,
					Value: "Lyrics",
					Emoji: ZiIcons.lyrics,
				},
				{
					Label: "Shuffle",
					Description: lang?.playerFunc?.Fields?.Shuffle || "Trộn bài",
					Value: "Shuffle",
					Emoji: ZiIcons.shuffle,
				},
				{
					Label: "Filter",
					Description: lang?.playerFunc?.Fields?.Filter || "Hiệu Ứng",
					Value: "Fillter",
					Emoji: ZiIcons.fillter,
				},
				{
					Label: "Save",
					Description: lang?.playerFunc?.Fields?.Save || "Save current queue",
					Value: "Save",
					Emoji: ZiIcons.save,
				},
			];

			const filteredFunctions = functions.filter((f) => {
				if (queue.isEmpty() && (f.Label === "Shuffle" || f.Label === "Queue")) return false;
				if (queue.node.volume > 99 && f.Value === "volinc") return false;
				if (queue.node.volume < 1 && f.Value === "voldec") return false;
				if (queue.node.volume === 0 && f.Value === "Mute") return false;
				if (queue.node.volume !== 0 && f.Value === "Unmute") return false;
				return true;
			});

			const functionOptions = filteredFunctions.map((f) => {
				return new StringSelectMenuOptionBuilder()
					.setLabel(f.Label)
					.setDescription(f.Description)
					.setValue(f.Value)
					.setEmoji(f.Emoji);
			});

			const functionRow = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("S_player_Func")
					.setPlaceholder(lang?.playerFunc?.RowFunc ?? "▶ | Chọn một chức năng khác để điều khiển player")
					.addOptions(functionOptions)
					.setMaxValues(1)
					.setMinValues(1),
			);

			const buttonRow = new ActionRowBuilder().addComponents(
				CreateButton({ id: "refresh", emoji: `${ZiIcons.refesh}`, disable: false }),
				CreateButton({
					id: "previous",
					emoji: `${ZiIcons.prev}`,
					disable: !queue?.history?.previousTrack,
				}),
				CreateButton({
					id: "pause",
					emoji: `${queue.node.isPlaying() ? `${ZiIcons.pause}` : `${ZiIcons.play}`}`,
					disable: false,
				}),
				CreateButton({ id: "next", emoji: `${ZiIcons.next}`, disable: false }),
				CreateButton({ id: "stop", emoji: `${ZiIcons.stop}`, disable: false }),
			);

			code.components = [relatedTracksRow, functionRow, buttonRow];
		} else {
			embed
				.setDescription(lang?.playerFunc?.QueueEmpty || `❌ | Hàng đợi trống\n✅ | Bạn có thể thêm 1 số bài hát`)
				.setColor("Red")
				.addFields({ name: " ", value: `𓊝 ┃ ﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏ ┃ 𓊝` });

			const buttonRow = new ActionRowBuilder().addComponents(
				CreateButton({ id: "refresh", emoji: `${ZiIcons.refesh}`, disable: false }),
				CreateButton({
					id: "previous",
					emoji: `${ZiIcons.prev}`,
					disable: !queue?.history?.previousTrack,
				}),
				CreateButton({ id: "search", emoji: `${ZiIcons.search}`, disable: false }),
				CreateButton({ id: "autoPlay", emoji: `${ZiIcons.loopA}`, disable: false }),
				CreateButton({ id: "stop", emoji: `${ZiIcons.stop}`, disable: false }),
			);
			code.components = [relatedTracksRow, buttonRow];
		}
		if (!!queue.metadata.LockStatus) {
			embed.addFields({
				name: `${ZiIcons.Lock} **${lang?.playerFunc?.Fields?.Lockdes}**`,
				value: " ",
				inline: false,
			});
		}
		if (queue.repeatMode !== 0) {
			embed.addFields({
				name: `${lang?.playerFunc?.Fields?.Loop || "Lặp lại"}: ${repeatMode[queue.repeatMode]}`,
				value: " ",
				inline: false,
			});
		}
		if (!!queue?.filters?.ffmpeg?.toArray().length) {
			embed.addFields({
				name: ` `,
				value: `**${lang?.playerFunc?.Fields?.Filter || "Filter"}: ${queue?.filters?.ffmpeg?.getFiltersEnabled()}**`.slice(
					0,
					1020,
				),
				inline: false,
			});
		}
		code.embeds = [embed];
		code.files = [];

		return code;
	},
};
