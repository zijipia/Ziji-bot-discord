const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { ZiGuild } = require("../../startup/mongoDB");

module.exports.data = new SlashCommandBuilder()
    .setName('join-to-create')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Join-to-create manager')
    .addSubcommand(command => 
        command
            .setName('setup')
            .setDescription('Setup the temporary voice system on this server')
            .addChannelOption(channel =>
                channel
                    .setName('channel') // Corrected: setName is valid
                    .setDescription('Join-to-create channel')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildVoice)
            )
            .addChannelOption(channel => 
                channel
                    .setName('category') // Corrected: setName is valid
                    .setDescription('The category that the temporary channels should be in')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildCategory)
            )
    )
    .addSubcommand(command =>
        command
            .setName('disable')
            .setDescription('Turn off the join-to-create system')
    );

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */
module.exports.execute = async ({ interaction, lang }) => {
    await interaction.deferReply({ ephemeral: true });

    const command = interaction.options.getSubcommand();
    try {
        switch (command) {
            case 'setup': {
                const channel = interaction.options.getChannel('channel');
                const category = interaction.options.getChannel('category');
                const guildId = interaction.guild.id;
                await ZiGuild.findOneAndUpdate(
                    { guildId }, // Query condition
                    { 
                        joinToCreate: {
                            enabled: true, 
                            voiceChannelId: channel.id, 
                            categoryId: category.id 
                        }
                    },
                    { new: true, upsert: true }
                );

                await interaction.followUp({
                    content: `Join-to-create has been successfully set up!\n**Voice Channel:** ${channel.name}\n**Category:** ${category.name}`,
                    ephemeral: true,
                });
                break;
            }
            case 'disable': {
                const guildId = interaction.guild.id;

                // Disable the join-to-create system
                const updatedGuild = await ZiGuild.findOneAndUpdate(
                    { guildId }, // Query condition
                    { "joinToCreate.enabled": false },
                    { new: true }
                );

                if (updatedGuild) {
                    await interaction.followUp({
                        content: `Join-to-create has been disabled.`,
                        ephemeral: true,
                    });
                } else {
                    await interaction.followUp({
                        content: `Join-to-create system was not set up.`,
                        ephemeral: true,
                    });
                }
                break;
            }
            default: {
                await interaction.followUp({
                    content: `Unknown subcommand.`,
                    ephemeral: true,
                });
                break;
            }
        }
    } catch (error) {
        console.error(error);
        await interaction.followUp({
            content: `An error occurred: ${error.message}`,
            ephemeral: true,
        });
    }
};
