
module.exports.data = {
    name: "Play / Add music",
    type: 3,
    options: [],
    integration_types: [0],
    contexts: [0],
}

module.exports.execute = async (interaction) => {
    const query = interaction.targetMessage.content;
    const command = interaction.client.functions.get("Search");
    await command.execute(interaction, query);
}