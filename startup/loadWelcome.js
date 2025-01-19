const { useDB, useWelcome } = require("@zibot/zihooks");
const Logger = require("./logger");
const logger = new Logger();
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
		logger.info(`Successfully reloaded ${indexs} welcome.`);
	} catch (error) {
		logger.error("Lỗi khi tải welcome:", error);
	}
};
