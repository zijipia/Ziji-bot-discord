const { Events, GuildMember, AttachmentBuilder } = require("discord.js");
const config = require("../config");
const { GreetingsCard } = require("../utility/GreetingsCard");

module.exports = {
	name: Events.GuildMemberRemove,
	type: "events",
	/**
	 *
	 * @param { GuildMember } member
	 */
	execute: async (member) => {
		// create card
		const card = new GreetingsCard()
			.setAvatar(member.user.displayAvatarURL({ size: 1024, forceStatic: true, extension: "png" }))
			.setDisplayName(member.user.username)
			.setImage(
				"https://cdn.discordapp.com/attachments/1150638982682652722/1265890654572118048/pngtree-free-vector-watercolor-galaxy-poster-background-template-picture-image_1055747.png?ex=66a3280b&is=66a1d68b&hm=2877d5d661892c3b5ee33d4d9fad651c7e463bb743a33b24c27c81a0ed5eb77e&",
			)
			.setType("goodbye")
			.setMessage("");

		const image = await card.build({ format: "png" });
		const attachment = new AttachmentBuilder(image, { name: "GreetingsCard.png" });
		const channel = member.client.channels.cache.get("1265894328786489487");
		await channel.send({ files: [attachment] });
	},
};
