const { Events, CommandInteraction } = require("discord.js");
const config = require("./../config")
module.exports = {
    name: Events.InteractionCreate,
    type: "events"
}

/**
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async (interaction) => {
    const { client, user } = interaction;
    let command;
    let commandType;

    // Determine the interaction type and set the command
    if (interaction.isChatInputCommand() || interaction.isAutocomplete() || interaction.isMessageContextMenuCommand()) {
        command = client.commands.get(interaction.commandName);
        commandType = 'command';

        // Handle cooldowns if not an autocomplete interaction
        if (!interaction.isAutocomplete()) {
            const now = Date.now();
            const cooldownDuration = (config?.defaultCooldownDuration ?? 3) * 1_000;
            const expirationTime = client.cooldowns.get(user.id) + cooldownDuration;

            if (client.cooldowns.has(user.id) && now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000);
                return interaction.reply({
                    content: `Please wait, you are on a cooldown for \`${interaction.commandName}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                    ephemeral: true
                });
            }

            client.cooldowns.set(user.id, now);
        }
    } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        command = client.functions.get(interaction.customId);
        commandType = 'function';
    }

    // If no command was found, log the error and return
    if (!command) {
        console.error(`No ${commandType} matching ${interaction.commandName || interaction.customId} was found.`);
        return;
    }

    // Try to execute the command and handle errors
    try {
        if (interaction.isAutocomplete()) {
            await command.autocomplete(interaction);
        } else {
            await command.execute(interaction);
        }
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