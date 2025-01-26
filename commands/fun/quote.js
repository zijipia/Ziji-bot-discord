const { MiQ } = require("makeitaquote");

module.exports.data = {
	name: "quote",
	description: "Generate a quote image.",
	type: 1, // slash command
	options: [
		{
			name: "text",
			description: "Write your quote here",
			type: 3, // string
			required: true,
		},
        {
            name: "user",
            description: "The user to display",
            type: 6,
            required: false,
        },
        {
            name: "nocolor",
            description: "Do you need a color for your quote image?",
            type: 5,
            required: false,
        }
	],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */
module.exports.execute = async ({ interaction, lang }) => {
    await interaction.deferReply();
    const text = await interaction.options.getString('text');
    const user = await interaction.options.getUser('user') || interaction.user;
    const nocolor = await interaction.options.getBoolean('nocolor');
    const miq = new MiQ()
        .setColor(true)
        .setText(text)
        .setDisplayname(user.displayName)
        .setUsername(user.username)
        .setAvatar(user.displayAvatarURL())
        .setWatermark(interaction.client.user.tag);
    if (nocolor) miq.setColor(false);
    const result = await miq.generate();
    await interaction.editReply(result)

}