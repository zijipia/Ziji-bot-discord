const { useMainPlayer, useQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const { CommandInteraction, AutocompleteInteraction } = require("discord.js");
const player = useMainPlayer();

module.exports.data = {
	name: "play",
	description: "Phát nhạc",
	type: 1, // slash commmand
	options: [
		{
			name: "next",
			description: "Thêm nhạc và tiếp theo",
			type: 1, // sub command
			options: [
				{
					name: "query",
					description: "Tên bài hát",
					required: true,
					type: 3,
					autocomplete: true,
				},
			],
		},
		{
			name: "assistant",
			description: "Thêm nhạc và điều khiển bằng giọng nói",
			type: 1, // sub command
			options: [
				{
					name: "query",
					description: "Tên bài hát",
					required: true,
					type: 3,
					autocomplete: true,
				},
			],
		},
		{
			name: "music",
			description: "Phát nhạc",
			type: 1, // sub command
			options: [
				{
					name: "query",
					description: "Tên bài hát",
					required: true,
					type: 3,
					autocomplete: true,
				},
			],
		},
	],
	integration_types: [0],
	contexts: [0],
};

/**
 * @param { object } command - object command
 * @param { CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	const commandtype = interaction.options?.getSubcommand();
	const query = interaction.options?.getString("query");
	const command = useFunctions().get("Search");
	if (commandtype === "next") {
		const queue = useQueue(interaction.guild.id);

		if (queue) {
			const res = await player.search(query, { fallbackSearchEngine: "youtube" });
			const track = res.tracks?.[0];

			if (track) {
				queue.insertTrack(track, 0);
				await interaction.reply({ content: lang.music.Next, ephemeral: true });
			} else {
				await interaction.reply({ content: lang.music.NOres, ephemeral: true });
			}
		} else {
			await command.execute(interaction, query, lang);
		}
	} else if (commandtype === "assistant") {
		await command.execute(interaction, query, lang, { assistant: true });
	} else {
		await command.execute(interaction, query, lang);
	}
	return;
};

/**
 * @param { object } autocomplete - object autocomplete
 * @param { AutocompleteInteraction } autocomplete.interaction - interaction
 * @param { import('../../lang/vi.js') } autocomplete.lang - language
 */

module.exports.autocomplete = async ({ interaction, lang }) => {
	try {
		const query = interaction.options.getString("query", true);
		if (!query) return;

		const results = await player.search(query, {
			fallbackSearchEngine: "youtube",
		});

		const tracks = results.tracks
			.filter((t) => t.title.length > 0 && t.title.length < 100 && t.url.length > 0 && t.url.length < 100)
			.slice(0, 10);

		if (!tracks.length) return;

		await interaction.respond(tracks.map((t) => ({ name: t.title, value: t.url })));
		return;
	} catch (e) {
		console.error(e);
	}
};
