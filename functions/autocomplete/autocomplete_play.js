const { useMainPlayer } = require("discord-player");
const { AutocompleteInteraction } = require("discord.js");
const player = useMainPlayer();

module.exports.data = {
    name: "play",
    type: "autocomplete",
};

/**
 * @param { AutocompleteInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    try {
        const query = interaction.options.getString('query', true);
        if (!query) return;

        const results = await player.search(query, {
            fallbackSearchEngine: "youtube",
        });

        const tracks = results.tracks
            .filter(t => t.title.length > 0 && t.title.length < 100 && t.url.length > 0 && t.url.length < 100)
            .slice(0, 10);

        if (!tracks.length) return;

        await interaction.respond(
            tracks.map(t => ({ name: t.title, value: t.url }))
        );
    } catch (e) {
        console.error(e);
    }
};
