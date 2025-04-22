const { parentPort, workerData } = require("worker_threads");
const { RankCardBuilder, Font } = require("canvacord");

async function buildImage(rankCard_data) {
	const { member, userDB, sss, strimg, status, colorr, avtaURL } = rankCard_data;
	Font.loadDefault();
	const rankCard = new RankCardBuilder()
		.setAvatar(avtaURL)
		.setUsername(`${userDB._doc?.coin || 0} xu`)
		.setCurrentXP(userDB._doc?.xp || 0)
		.setLevel(userDB._doc?.level || 1)
		.setRequiredXP((userDB._doc?.level || 1) * 50 + 1)
		.setProgressCalculator(() => Math.floor(((userDB._doc?.xp || 0) / ((userDB._doc?.level || 1) * 50 + 1)) * 100))
		.setStatus(status)
		.setDisplayName(member?.tag || member?.nickname || member?.user?.tag, colorr)
		.setBackground(strimg)
		.setRank(sss + 1)
		.setOverlay(15.5)
		.setStyles({
			progressbar: {
				thumb: {
					style: {
						backgroundColor: colorr,
					},
				},
			},
			username: {
				name: {
					style: {
						color: colorr,
					},
				},
			},
			statistics: {
				level: {
					text: {
						style: {
							color: colorr,
						},
					},
					value: {
						style: {
							color: colorr,
						},
					},
				},
				xp: {
					text: {
						style: {
							color: colorr,
						},
					},
					value: {
						style: {
							color: colorr,
						},
					},
				},
				rank: {
					text: {
						style: {
							color: colorr,
						},
					},
					value: {
						style: {
							color: colorr,
						},
					},
				},
			},
		});

	const buffer = await rankCard.build({ format: "png" });
	parentPort.postMessage(buffer.buffer); // Send as ArrayBuffer
}

// Listen for termination signal
parentPort.on("message", (message) => {
	if (message === "terminate") {
		process.exit(0); // Gracefully exit
	}
});

buildImage(workerData.rankCard_data).catch((error) => {
	console.error("Error in worker:", error);
	process.exit(1);
});
