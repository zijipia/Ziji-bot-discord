const { useMainPlayer, GuildQueue, QueryType } = require("discord-player");
const player = useMainPlayer();
const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    Client
} = require("discord.js");
const ZiIcons = require("./../../utility/icon");

// Helper function to create a button
const CreateButton = ({ id = null, style = ButtonStyle.Secondary, label = null, emoji = null, disable = true }) => {
    const button = new ButtonBuilder()
        .setCustomId(`player_${id}`)
        .setStyle(style)
        .setDisabled(disable);
    if (label) button.setLabel(label);
    if (emoji) button.setEmoji(emoji);
    return button;
};

// Helper function to get related tracks
const getRelatedTracks = async (track, history) => {
    try {
        let tracks = (await track?.extractor?.getRelatedTracks(track, history))?.tracks || (await player.extractors.run(async (ext) => {
            const res = await ext.getRelatedTracks(track, history);
            if (!res.tracks.length) {
                return false;
            }
            return res.tracks;
        }))?.result || [];

        if (!tracks.length) tracks = (await player.extractors.run(async (ext) => {
            const res = await ext.getRelatedTracks(track, history);
            if (!res.tracks.length) {
                return false;
            }
            return res.tracks;
        }))?.result || [];

        const unique = tracks.filter((tr) => !history.tracks.find((t) => t.url === tr.url));
        if (unique.length) return unique;
        return [];
    } catch (e) {
        console.log(e);
        return [];
    }
};
// Helper function to get query Type Icon
const getQueryTypeIcon = (type) => {
    switch (type) {
        case QueryType.YOUTUBE:
        case QueryType.YOUTUBE_PLAYLIST:
        case QueryType.YOUTUBE_SEARCH:
        case QueryType.YOUTUBE_VIDEO:
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
            return ZiIcons.AttachmentIconURL;
    }
}

const repeatMode = ["OFF", `${ZiIcons.loop1} Track`, `${ZiIcons.loopQ} Queue`, `${ZiIcons.loopA} AutoPlay`];

module.exports = {
    data: { name: "player", type: "player" },
    /**
     * 
     * @param {Client} client 
     * @param {GuildQueue} queue 
     * @returns 
     */
    execute: async (client, queue, tracks) => {
        const track = tracks ?? queue?.currentTrack ?? queue?.history?.previousTrack;
        const requestedBy = track?.requestedBy ?? queue.metadata.requestedBy;
        const queryTypeIcon = getQueryTypeIcon(track?.queryType);
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${track?.title}`, iconURL: `${queryTypeIcon}`, url: track?.url
            })
            .setDescription(`Volume: **${queue.node.volume}** %`)
            .setColor("Random")
            .setFooter({
                text: `Đã thêm bởi: ${requestedBy.username}`,
                iconURL: requestedBy.displayAvatarURL({ size: 1024 })
            })
            .setTimestamp()
            .setImage(track?.thumbnail)

        const code = { content: "" };
        const relatedTracks = await getRelatedTracks(track, queue.history);
        const filteredTracks = relatedTracks.filter(t => t.url.length < 100).slice(0, 20);

        const trackOptions = filteredTracks.map((track, i) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${i + 1}: ${track.title}`.slice(0, 99))
                .setDescription(`Duration: ${track.duration} source: ${track.queryType}`)
                .setValue(`${track.url}`)
                .setEmoji(`${ZiIcons.Playbutton}`);
        });

        const relatedTracksRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("player_SelectionTrack")
                .setPlaceholder("▶ | Chọn một bài hát để thêm vào hàng đợi")
                .addOptions(trackOptions)
                .setMaxValues(1)
                .setMinValues(1)
                .setDisabled(!trackOptions.length)
        );

        if (queue.node.isPlaying() || !queue.isEmpty()) {
            embed.addFields({ name: " ", value: `${queue.node.createProgressBar({ leftChar: "﹏", rightChar: "﹏", indicator: "𓊝" })}` });
            const functions = [
                { Label: "Search Tracks", Description: "Tìm kiếm bài hát", Value: "Search", Emoji: ZiIcons.search },
                { Label: !queue.metadata.LockStatus ? "Lock" : "Un Lock", Description: !queue.metadata.LockStatus ? "Khoá truy cập player" : "Mở khoá truy cập player", Value: "Lock", Emoji: !queue.metadata.LockStatus ? ZiIcons.Lock : ZiIcons.UnLock },
                { Label: "Loop", Description: "Lặp Lại", Value: "Loop", Emoji: ZiIcons.loop },
                { Label: "AutoPlay", Description: "Tự động phát", Value: "AutoPlay", Emoji: ZiIcons.loopA },
                { Label: "Queue", Description: "Hàng đợi", Value: "Queue", Emoji: ZiIcons.queue },
                { Label: "Mute", Description: "Chỉnh âm lượng về 0", Value: "Mute", Emoji: ZiIcons.mute },
                { Label: "Vol +", Description: "Tăng âm lượng", Value: "volinc", Emoji: ZiIcons.volinc },
                { Label: "Vol -", Description: "Giảm âm lượng", Value: "voldec", Emoji: ZiIcons.voldec },
                { Label: "Lyrics", Description: "Lời bài hát", Value: "Lyrics", Emoji: ZiIcons.lyrics },
                { Label: "Shuffle", Description: "Trộn bài", Value: "Shuffle", Emoji: ZiIcons.shuffle },
                { Label: "Fillter", Description: "Hiệu Ứng", Value: "Fillter", Emoji: ZiIcons.fillter }
            ];

            const filteredFunctions = functions.filter(f => {
                if (queue.isEmpty() && (f.Label === "Shuffle" || f.Label === "Queue")) return false;
                if (queue.node.volume > 99 && f.Value === "volinc") return false;
                if (queue.node.volume < 1 && f.Value === "voldec") return false;
                if (queue.node.volume == 0 && f.Value === "Mute") return false;

                return true;
            });

            const functionOptions = filteredFunctions.map(f => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(f.Label)
                    .setDescription(f.Description)
                    .setValue(f.Value)
                    .setEmoji(f.Emoji);
            });

            const functionRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("player_SelectionFunc")
                    .setPlaceholder("▶ | Chọn một chức năng khác để điều khiển player")
                    .addOptions(functionOptions)
                    .setMaxValues(1)
                    .setMinValues(1)
            );

            const buttonRow = new ActionRowBuilder().addComponents(
                CreateButton({ id: "refresh", emoji: `${ZiIcons.refesh}`, disable: false }),
                CreateButton({ id: "previous", emoji: `${ZiIcons.prev}`, disable: !queue?.history?.previousTrack }),
                CreateButton({ id: "pause", emoji: `${queue.node.isPlaying() ? `${ZiIcons.pause}` : `${ZiIcons.play}`}`, disable: false }),
                CreateButton({ id: "next", emoji: `${ZiIcons.next}`, disable: false }),
                CreateButton({ id: "stop", emoji: `${ZiIcons.stop}`, disable: false })
            );

            code.components = [relatedTracksRow, functionRow, buttonRow];
        } else {
            embed
                .setDescription(`❌ | Hàng đợi trống\n✅ | Bạn có thể thêm 1 số bài hát`)
                .setColor("Red")
                .addFields({ name: " ", value: `𓊝 ┃ ﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏ ┃ 𓊝` });

            const buttonRow = new ActionRowBuilder().addComponents(
                CreateButton({ id: "refresh", emoji: `${ZiIcons.refesh}`, disable: false }),
                CreateButton({ id: "previous", emoji: `${ZiIcons.prev}`, disable: !queue?.history?.previousTrack }),
                CreateButton({ id: "search", emoji: `${ZiIcons.search}`, disable: false }),
                CreateButton({ id: "stop", emoji: `${ZiIcons.stop}`, disable: false })
            );
            code.components = [relatedTracksRow, buttonRow];

        }

        if (queue.repeatMode !== 0) {
            embed.addFields({
                name: `Lặp lại: ${repeatMode[queue.repeatMode]}`,
                value: " ",
                inline: false
            });
        }
        if (!!queue?.filters?.ffmpeg?.toArray().length) {
            embed.addFields(
                { name: ` `, value: `**Filter: ${queue?.filters?.ffmpeg?.getFiltersEnabled()}**`.slice(0, 1020), inline: false }
            );
        }
        code.embeds = [embed];
        code.files = [];

        return code;
    }
};
