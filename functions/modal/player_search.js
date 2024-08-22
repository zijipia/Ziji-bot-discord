const { ModalSubmitInteraction, ModalBuilder } = require("discord.js");

module.exports.data = {
    name: "modal_search",
    type: "modal",
}

/**
 * @param { ModalSubmitInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
    const { guild, client, fields } = interaction;
    const query = fields.getTextInputValue("search-input");
    const command = client.functions.get("Search");
    await command.execute(interaction, query, lang);

}