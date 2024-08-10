const { useMainPlayer, useQueue } = require("discord-player");
const { CommandInteraction } = require("discord.js");
const player = useMainPlayer()



module.exports.data = {
    name: "play",
    description: "Phát nhạc",
    type: 1, // slash commmand
    options: [{
        name: "next",
        description: "Thêm nhạc và tiếp theo",
        type: 1, // sub command
        options: [{
            name: "query",
            description: "Tên bài hát",
            required: true,
            type: 3,
            autocomplete: true
        }]
    }, {
        name: "music",
        description: "Phát nhạc",
        type: 1, // sub command
        options: [{
            name: "query",
            description: "Tên bài hát",
            required: true,
            type: 3,
            autocomplete: true
        }]
    },],
    integration_types: [0],
    contexts: [0],
}
/**
 * 
 * @param { CommandInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    const commandtype = interaction.options?.getSubcommand();
    const query = interaction.options?.getString("query")
    const command = interaction.client.functions.get("Search");
    if (commandtype === "next") {
        const queue = useQueue(interaction.guild.id);

        if (queue) {
            const res = await player.search(query, { fallbackSearchEngine: "youtube" });
            const track = res.tracks?.[0];

            if (track) {
                queue.insertTrack(track, 0);
                await interaction.reply({ content: "Track added to the beginning of the queue.", ephemeral: true });
            } else {
                await interaction.reply({ content: "No tracks found.", ephemeral: true });
            }
        } else {
            await command.execute(interaction, query, lang);
        }
    } else {
        await command.execute(interaction, query, lang);
    }
}