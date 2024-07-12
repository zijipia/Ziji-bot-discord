const { Events, BaseInteraction } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    type: "events"
}

/**
 * @param { BaseInteraction } interaction
 */
module.exports.execute = async (interaction) => {
    let command;
    let commandType;

    if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand()) {
        command = interaction.client.commands.get(interaction.commandName);
        commandType = 'command';
    } else if (interaction.isAutocomplete() || interaction.isMessageComponent() || interaction.isModalSubmit()) {
        command = interaction.client.functions.get(interaction.isAutocomplete() ? interaction.commandName : interaction.customId);
        commandType = interaction.isAutocomplete() ? 'autocomplete' : 'function';
    }

    if (!command) {
        console.error(`No ${commandType} matching ${interaction.commandName || interaction.customId} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const response = { content: 'There was an error while executing this command!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
        } else {
            await interaction.reply(response);
        }
    }
};
