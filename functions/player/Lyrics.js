const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuInteraction, ButtonStyle } = require("discord.js");
const { useMainPlayer, useQueue, Util, GuildQueue } = require("discord-player");

const player = useMainPlayer();
const ZiIcons = require("../../utility/icon");
/**
 * Executes the command to edit metadata.
 * @param { StringSelectMenuInteraction } interaction - The guild where the command is executed.
 * @param { Object } options - The metadata to update.
 * @param { String } options.query - The Query search lyrics
 * @param { String } options.type - The type of lyrics syncedLyrics or plainLyrics
 * @param { GuildQueue } options.queue - The Queue
 */

module.exports.execute = async (interaction, options) => {
	const queue = options?.queue || useQueue(interaction?.guild?.id);

	const query =
		options?.query ||
		queue.currentTrack.cleanTitle.replace(/lyrics|Full/g, "") ||
		queue.currentTrack.title ||
		"891275176409460746891275176409460746891275176409460746";

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("B_Lyrics_input")
			.setStyle(ButtonStyle.Secondary)
			.setLabel("Input Lyrics Name")
			.setEmoji(ZiIcons?.search),
		new ButtonBuilder()
			.setCustomId("B_Lyrics_cancel")
			.setStyle(ButtonStyle.Secondary)
			.setLabel("Disable syncedLyrics")
			.setEmoji("❌"),
	);
	//embed
	const LyricsEmbed = new EmbedBuilder()
		.setDescription("❌ | No Lyrics Found!\n- Query:" + `${query}`)
		.setColor("Random")
		.setThumbnail(queue?.currentTrack?.thumbnail || null);
	const lyrics = await player.lyrics.search({ q: query });

	const trimmedLyrics = lyrics?.at(0)?.plainLyrics.substring(0, 1997);

	if (trimmedLyrics.length) {
		LyricsEmbed.setTitle(`${lyrics[0]?.trackName} - ${lyrics[0]?.artistName}`).setDescription(
			trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics,
		);
	}

	// plainLyrics
	if (options?.type !== "syncedLyrics") {
		return interaction.editReply({ content: "", embeds: [LyricsEmbed] }).catch(async () => {
			await interaction.followUp({ content: "", embeds: [LyricsEmbed] }).catch(() => {});
		});
	}
	// syncedLyrics
	if (!queue) return;

	if (!lyrics?.at(0)?.syncedLyrics) {
		await queue.metadata.ZiLyrics?.mess.edit({ content: "", components: [row], embeds: [LyricsEmbed] }).catch(() => {});
		return;
	}

	const syncedLyrics = queue.syncedLyrics(lyrics.at(0));

	let current_Lyric = "",
		previous_Lyric = "",
		pre_previous_Lyric = "";

	syncedLyrics.onChange(async (lyricss, timestamp) => {
		current_Lyric = `[${Util.buildTimeCode(Util.parseMS(timestamp))}]: ${lyricss}`;

		const embed = LyricsEmbed.setTitle(`${lyrics[0]?.trackName} - ${lyrics[0]?.artistName}`).setDescription(
			`${pre_previous_Lyric}\n${previous_Lyric}\n**${current_Lyric}**.`,
		);

		//store previous Lyric
		pre_previous_Lyric = previous_Lyric;
		previous_Lyric = current_Lyric;

		//send messenger
		await queue.metadata.ZiLyrics?.mess.edit({ content: "", components: [row], embeds: [embed] }).catch(async () => {
			//update New
			queue.metadata.ZiLyrics.mess = await queue.metadata.ZiLyrics?.channel
				.send({ content: "", components: [row], embeds: [embed] })
				.catch(() => {});
		});
	});
	// subscribe syncedLyrics
	queue.metadata.ZiLyrics.unsubscribe = syncedLyrics.subscribe();
	return;
};

/**
 * Command data for Lyrics.
 */

module.exports.data = {
	name: "Lyrics",
	type: "player",
};
