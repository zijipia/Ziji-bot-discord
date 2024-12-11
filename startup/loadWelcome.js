const { useDB, useWelcome } = require("@zibot/zihooks");

module.exports = async () => {
	try {
		let indexs = 0;
		const Welcome = await useDB().ZiWelcome.find();
		Welcome.forEach((r) => {
			const Res = useWelcome();
			if (!Res.has(r.guildId)) {
				Res.set(r.guildId, []);
			}
			Res.get(r.guildId).push({
				channel: r.channel,
				content: r.content,
				Bchannel: r.channel,
				Bcontent: r.content,
			});
			indexs++;
		});
		console.log(`Successfully reloaded ${indexs} welcome.`);
	} catch (error) {
		console.error("Lỗi khi tải welcome:", error);
	}
};
