const { MessageContextMenuCommandInteraction } = require("discord.js");

module.exports.data = {
    name: "Play / Add music",
    type: 3, // context
    options: [],
    integration_types: [0],
    contexts: [0],
}
/**
 * 
 * @param { MessageContextMenuCommandInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    let query = interaction.targetMessage.content;
    if (!query) {
        const embed = interaction.targetMessage.embeds?.at(0).data;
        if (embed) {
            const Fields = embed.fields?.at(0)
            if (Fields && Fields.value.includes("﹏"))
                query = embed?.author?.url
            if (!query) {
                query = embed?.description
            }
        }
    }
    const command = interaction.client.functions.get("Search");
    await command.execute(interaction, query, lang);
}