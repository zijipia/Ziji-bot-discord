const { parentPort, workerData } = require("worker_threads");
const { LeaderboardBuilder, Font } = require("canvacord");

async function buildImage(Leaderboard_data) {
	const { Header, Players } = Leaderboard_data;
	Font.loadDefault();
	const leaderboard = new LeaderboardBuilder().setHeader(Header).setPlayers(Players);
	const leaderboardBuffer = await leaderboard.build({ format: "png" });
	parentPort.postMessage(leaderboardBuffer.buffer); // Send as ArrayBuffer
}

// Listen for termination signal
parentPort.on("message", (message) => {
	if (message === "terminate") {
		process.exit(0); // Gracefully exit
	}
});

buildImage(workerData.Leaderboard_data).catch((error) => {
	console.error("Error in worker:", error);
	process.exit(1);
});
