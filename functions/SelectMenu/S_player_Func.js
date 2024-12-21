const { useQueue, serialize, decode, encode } = require("discord-player");
const { useFunctions, useDB, useConfig } = require("@zibot/zihooks");
const Functions = useFunctions();
const config = useConfig();
const {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	AttachmentBuilder,
	EmbedBuilder,
} = require("discord.js");
const Encryptor = require("@zibot/ziencryptor");

module.exports.data = {
	name: "S_player_Func",
	type: "SelectMenu",
};
async function Update_Player(queue) {
	const player = Functions.get("player_func");
	if (!player) return;
	const res = await player.execute({ queue });
	queue.metadata.mess.edit(res);
}

/**
 * @param { object } selectmenu - object selectmenu
 * @param { import ("discord.js").StringSelectMenuInteraction } selectmenu.interaction - selectmenu interaction
 * @param { import('../../lang/vi.js') } selectmenu.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	const { guild, client, values, user } = interaction;
	const query = values?.at(0);
	const queue = useQueue(guild.id);
	switch (query) {
		case "Search": {
			const modal = new ModalBuilder()
				.setTitle("Search")
				.setCustomId("M_player_search")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("search-input")
							.setLabel("Search for a song")
							.setPlaceholder("Search or Url")
							.setStyle(TextInputStyle.Short),
					),
				);
			await interaction.showModal(modal);
			return;
		}
		case "Queue": {
			const QueueTrack = Functions.get("Queue");
			QueueTrack.execute(interaction, queue);
			return;
		}
		case "Fillter": {
			await interaction.deferReply();
			const Fillter = Functions.get("Fillter");
			await Fillter.execute(interaction, null);
			return;
		}
	}
	await interaction.deferUpdate().catch((e) => console.error);
	if (!queue) return interaction.followUp({ content: lang.music.NoPlaying, ephemeral: true });
	// Kiểm tra xem có khóa player không
	if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id)
		return interaction.followUp({ content: lang.until.noPermission, ephemeral: true });

	// Kiểm tra xem người dùng có ở cùng voice channel với bot không
	const botVoiceChannel = interaction.guild.members.me.voice.channel;
	const userVoiceChannel = interaction.member.voice.channel;
	if (!botVoiceChannel || botVoiceChannel.id !== userVoiceChannel?.id)
		return interaction.followUp({ content: lang.music.NOvoiceMe, ephemeral: true });
	const DataBase = useDB();
	switch (query) {
		case "Lock": {
			if (queue.metadata.requestedBy?.id !== user.id) {
				return interaction.reply({
					content: "You cannot interact with this menu.",
					ephemeral: true,
				});
			}
			queue.metadata.LockStatus = !queue.metadata.LockStatus;
			await Update_Player(queue);
			return;
		}
		case "Loop": {
			const repeatMode =
				queue.repeatMode === 0 ? 1
				: queue.repeatMode === 1 ? 2
				: queue.repeatMode === 2 ? 3
				: 0;
			queue.setRepeatMode(repeatMode);

			await Update_Player(queue);
			return;
		}
		case "AutoPlay": {
			queue.setRepeatMode(queue.repeatMode === 3 ? 0 : 3);

			await Update_Player(queue);
			return;
		}
		case "Mute": {
			queue.node.setVolume(0);
			await Update_Player(queue);
			return;
		}
		case "unmute": {
			const volumd = config?.PlayerConfig.volume ?? 100;
			if (volumd === "auto") {
				volumd = DataBase ? ((await DataBase.ZiUser.findOne({ userID: user.id }))?.volume ?? 100) : 100;
			}
			const Vol = Math.min(volumd + 10, 100);
			queue.node.setVolume(Vol);
			await Update_Player(queue);
			return;
		}
		case "volinc": {
			const current_Vol = queue.node.volume;
			const Vol = Math.min(current_Vol + 10, 100);
			if (DataBase) {
				await DataBase.ZiUser.updateOne({ userID: user.id }, { $set: { volume: Vol }, $upsert: true });
			}
			queue.node.setVolume(Vol);
			await Update_Player(queue);
			return;
		}
		case "voldec": {
			const current_Vol = queue.node.volume;
			const Vol = Math.max(current_Vol - 10, 0);
			if (DataBase) {
				await DataBase.ZiUser.updateOne({ userID: user.id }, { $set: { volume: Vol }, $upsert: true });
			}
			queue.node.setVolume(Vol);
			await Update_Player(queue);
			return;
		}
		case "Lyrics": {
			const ZiLyrics = queue.metadata.ZiLyrics;
			if (!ZiLyrics?.Active) {
				ZiLyrics.Active = true;
				ZiLyrics.mess = await interaction.followUp({
					content: "<a:loading:1151184304676819085> Loading...",
				});
				ZiLyrics.channel = interaction.channel;
				const Lyrics = Functions.get("Lyrics");
				if (!Lyrics) return;
				await Lyrics.execute(null, { type: "syncedLyrics", queue });
				return;
			}
			ZiLyrics.mess.delete().catch(() => {});
			ZiLyrics.Active = false;
			try {
				if (ZiLyrics?.unsubscribe && typeof ZiLyrics.unsubscribe === "function") {
					ZiLyrics.unsubscribe();
				}
			} catch (error) {
				console.error("Error unsubscribing from lyrics:", error);
			}
			return;
		}
		case "Shuffle": {
			queue.tracks.shuffle();
			await Update_Player(queue);
			return;
		}
		case "Save": {
			const trackss = queue.tracks.map((t) => serialize(t));
			trackss.unshift(serialize(queue.currentTrack));
			const encrypt = new Encryptor("Z");
			const encrypted = encrypt.encrypt(encode(trackss));
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setAuthor({ name: `${interaction.user.username} Save Queue:`, iconURL: interaction.user.displayAvatarURL({}) })
						.setColor(lang.color || "Random")
						.setDescription(`**${trackss.map((t) => `* ${t.title}\n`).join("")}**`.slice(0, 4090))
						.setFooter({
							text: `${lang.until.requestBy} ${interaction.user?.username}`,
							iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
						})
						.setTimestamp(),
				],
				files: [new AttachmentBuilder(Buffer.from(encrypted, "utf-8"), { name: `zsave.txt` })],
			});
			return;
		}
	}

	return;
};
