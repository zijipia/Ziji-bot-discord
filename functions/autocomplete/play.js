const { useMainPlayer } = require("discord-player")
const player = useMainPlayer();
module.exports.data = {
    name: "play",
    description: "Xem ảnh đại diện của ai đó",
    type: "autocomplete",
}

module.exports.execute = async (interaction) => {
    try {
        const query = interaction.options.getString('query', true);
        const results = await player.search(query, {
            fallbackSearchEngine: "youtube"
        });
        return interaction.respond(
            results.tracks.slice(0, 10).map((t) => ({
                name: t.title,
                value: t.url
            }))
        );
    } catch (e) {
        return interaction.respond();
    }

}