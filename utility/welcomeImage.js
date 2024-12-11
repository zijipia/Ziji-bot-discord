const { parentPort, workerData } = require("worker_threads");
const { GreetingsCard } = require("./GreetingsCard");

async function buildImage(workerData) {
	const { ZDisplayName, ZType, ZAvatar, ZMessage, ZImage } = workerData;
	const card = new GreetingsCard().setDisplayName(ZDisplayName).setType(ZType).setAvatar(ZAvatar).setMessage(ZMessage);

	const buffer = await card.build({ format: "png" });
	parentPort.postMessage(buffer.buffer); // Send as ArrayBuffer
}

// Listen for termination signal
parentPort.on("message", (message) => {
	if (message === "terminate") {
		process.exit(0); // Gracefully exit
	}
});

buildImage(workerData).catch((error) => {
	console.error("Error in worker:", error);
	process.exit(1);
});
