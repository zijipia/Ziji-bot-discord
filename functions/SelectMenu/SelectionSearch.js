const { StringSelectMenuInteraction } = require("discord.js");

module.exports.data = {
    name: "player_SelectionSearch",
    type: "SelectMenu",
}
/**
 * @param { StringSelectMenuInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
    const query = interaction.values?.at(0)
    if (query === "cancel") return interaction.message.delete().catch(e => { });
    const command = interaction.client.functions.get("Search");
    await command.execute(interaction, query, lang);
    return;
}