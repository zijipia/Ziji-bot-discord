const { useConfig, useWelcome } = require("@zibot/zihooks");
const { Events, GuildMember, AttachmentBuilder } = require("discord.js");
const config = useConfig();
const { Worker } = require("worker_threads");

async function buildImageInWorker(workerData) {
	return new Promise((resolve, reject) => {
		const worker = new Worker("./utility/welcomeImage.js", {
			workerData, //: { ZDisplayName, ZType, ZAvatar, ZMessage, ZImage },
		});

		worker.on("message", (arrayBuffer) => {
			try {
				const buffer = Buffer.from(arrayBuffer);
				if (!Buffer.isBuffer(buffer)) {
					throw new Error("Received data is not a buffer");
				}
				const attachment = new AttachmentBuilder(buffer, { name: "welcome.png" });
				resolve(attachment);
			} catch (error) {
				reject(error);
			} finally {
				worker.postMessage("terminate");
			}
		});

		worker.on("error", reject);

		worker.on("exit", (code) => {
			if (code !== 0) {
				reject(new Error(`Worker stopped with exit code ${code}`));
			}
		});
	});
}

module.exports = {
	name: Events.GuildMemberAdd,
	type: "events",
	/**
	 *
	 * @param { GuildMember } member
	 */
	execute: async (member) => {
		// create card
		const welcome = useWelcome().get(member.guild.id)?.at(0);
		console.log(welcome);
		try {
			const attachment = await buildImageInWorker({
				ZDisplayName: member.user.username,
				ZType: "welcome",
				ZAvatar: member.user.displayAvatarURL({ size: 1024, forceStatic: true, extension: "png" }),
				ZMessage: welcome.content ?? "To the server!",
			});
			const channel = await member.client.channels.fetch(welcome.channel);
			await channel.send({ files: [attachment] });
		} catch (error) {
			console.error("Error building image:", error);
		}

		// const card = new GreetingsCard().setImage(
		// 	"https://cdn.discordapp.com/attachments/1150638982682652722/1265890654572118048/pngtree-free-vector-watercolor-galaxy-poster-background-template-picture-image_1055747.png?ex=66a3280b&is=66a1d68b&hm=2877d5d661892c3b5ee33d4d9fad651c7e463bb743a33b24c27c81a0ed5eb77e&",
		// );
	},
};
