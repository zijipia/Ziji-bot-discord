const { useLogger } = require("@zibot/zihooks");
const simpleGit = require("simple-git");
const git = simpleGit();

const checkUpdate = async () => {
	const logger = useLogger();
	await git.fetch();
	const status = await git.status();
	if (status.behind > 0) {
		logger.info(`There are ${status.behind} new commits in this repository. Pulling`);
		try {
			await git.pull();
			logger.info("Successfully pulled the latest changes.");
		} catch (error) {
			logger.error("Failed to pull the latest changes:", error);
		}
	} else {
		logger.info("You are using the lastest version.");
	}
};

module.exports = {
	checkUpdate,
};
