const { useMainPlayer, useQueue } = require("discord-player");
const { CommandInteraction } = require("discord.js");
const player = useMainPlayer()



module.exports.data = {
    name: "play",
    description: "Phát nhạc",
    type: 1,
    options: [{
        name: "query",
        description: "Tên bài hát",
        required: true,
        type: 3,
        autocomplete: true
    }],
    integration_types: [0],
    contexts: [0],
}
/**
 * 
 * @param { CommandInteraction } interaction 
 */
module.exports.execute = async (interaction) => {
    const query = interaction.options?.getString("query")
    const command = interaction.client.functions.get("Search");
    await command.execute(interaction, query);


}