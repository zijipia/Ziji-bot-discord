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
    let command;
    let commandType;
    const { client, user } = interaction
    //cooldowns 
    if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand()) {
        const now = Date.now();
        if (!!client.cooldowns.has(user.id)) {
            const cooldownAmount = (config?.defaultCooldownDuration ?? 3) * 1_000;
            const expirationTime = client.cooldowns.get(user.id) + cooldownAmount;
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000);
                return interaction.reply({ content: `Please wait, you are on a cooldown for \`${interaction?.commandName}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
            }
        }
        client.cooldowns.set(user.id, now);
        command = client.commands.get(interaction.commandName);
        commandType = 'command';
    } else if (interaction.isAutocomplete() || interaction.isMessageComponent() || interaction.isModalSubmit()) {
        command = client.functions.get(interaction.isAutocomplete() ? interaction.commandName : interaction.customId);
        commandType = interaction.isAutocomplete() ? 'autocomplete' : 'function';
    }

    if (!command) {
        console.error(`No ${commandType} matching ${interaction.commandName || interaction.customId} was found.`);
        return;
    }
    const langfunc = client.functions.get("ZiRank");
    const lang = await langfunc.execute(client, interaction.user, 1);

    try {
        await command.execute(interaction, lang);
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
