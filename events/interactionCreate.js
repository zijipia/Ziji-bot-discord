const { Events, CommandInteraction } = require("discord.js");
const config = require("./../config");

module.exports = {
    name: Events.InteractionCreate,
    type: "events",

    /**
     * @param {CommandInteraction} interaction
     */
    execute: async (interaction) => {
        const { client, user } = interaction;
        const now = Date.now();
        let command, commandType;

        if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand() || interaction.isAutocomplete()) {
            const cooldownAmount = (config?.defaultCooldownDuration ?? 3) * 1000;
            const expirationTime = client.cooldowns.get(user.id) + cooldownAmount;

            if (client.cooldowns.has(user.id) && now < expirationTime) {
                return interaction.reply({
                    content: `Please wait, you are on a cooldown for \`${interaction.commandName}\`. You can use it again <t:${Math.round(expirationTime / 1000)}:R>.`,
                    ephemeral: true
                });
            }

            client.cooldowns.set(user.id, now);
            command = client.commands.get(interaction.commandName);
            commandType = 'command';
        } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            command = client.functions.get(interaction.customId);
            commandType = 'function';
        }

        if (!command) {
            console.error(`No ${commandType} matching ${interaction.commandName || interaction.customId} was found.`);
            return;
        }

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
    }
};
