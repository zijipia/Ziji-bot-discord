const { useFunctions, useClient, useLogger } = require("@zibot/zihooks");
const Functions = useFunctions();
const client = useClient();
const logger = useLogger();

module.exports = {
	name: "line",
	type: "console",
	enable: true,

	/**
	 * @param { String } input - console input
	 */
	execute: async (input) => {
		const args = input.trim().split(/ +/);
		const command = args.shift().toLowerCase();

		switch (command) {
			case "status":
				logger.info(`Bot đang ${client.isReady() ? "hoạt động" : "tắt"}`);
				break;
			case "stop":
				logger.info("Đang tắt bot...");
				client.destroy();
				process.exit(0);
				break;
			case "ping":
				logger.info(`Pong! Độ trễ của bot là ${client.ws.ping}ms`);
				break;
			case "help":
				logger.info(
					`Danh sách các lệnh:\n- help: Hiển thị trợ giúp\n- ping: Hiển thị độ trễ bot\n- stop: Tắt bot\n- status: Trả về trạng thái bot`,
				);
				break;
			default:
				logger.error(`Lệnh không hợp lệ: ${command}`);
		}
	},
};
