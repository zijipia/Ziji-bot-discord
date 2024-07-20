const { useMainPlayer } = require("discord-player");
const { AutocompleteInteraction } = require("discord.js");
const player = useMainPlayer();

module.exports.data = {
    name: "play",
    type: "autocomplete",
}
/**
 * 
 * @param { AutocompleteInteraction } interaction 
 * @returns 
 */
module.exports.execute = async (interaction) => {
    try {
        const query = interaction.options.getString('query', true);
        if (!query) return;
        const results = await player.search(query, {
            fallbackSearchEngine: "youtube"
        });
        const tracks = results.tracks.slice(0, 10)
        if (!tracks.length) return;

        return interaction.respond(
            tracks?.map((t) => ({
                name: t.title,
                value: t.url
            }))
        );
    } catch (e) {
        return;
    }

}