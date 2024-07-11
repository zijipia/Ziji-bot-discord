
module.exports.data = {
    name: "Play / Add music",
    type: 3,
    options: [],
    integration_types: [0],
    contexts: [0],
}

module.exports.execute = async (interaction) => {
    const command = interaction.client.commands.get("play");
    await command.execute(interaction);
}