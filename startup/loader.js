const { table } = require("table");
const fs = require("fs").promises;
const chalk = require("chalk");
const path = require("node:path");
const config = require("../config");

const loadFiles = async (directory, collection) => {
	try {
		const folders = await fs.readdir(directory);
		const clientCommands = [];

		await Promise.all(
			folders.map(async (folder) => {
				const folderPath = path.join(directory, folder);
				const files = await fs.readdir(folderPath).then((files) => files.filter((file) => file.endsWith(".js")));

				await Promise.all(
					files.map(async (file) => {
						const filePath = path.join(folderPath, file);
						try {
							const module = require(path.resolve(filePath));
							if ("data" in module && "execute" in module) {
								const isDisabled = config.disabledCommands.includes(module.data.name) || module.data?.enable == false;
								clientCommands.push([chalk.hex(isDisabled ? "#4733FF" : "#E5C3FF")(module.data.name), isDisabled ? "❌" : "✅"]);
								if (!isDisabled) collection.set(module.data.name, module);
							} else {
								clientCommands.push([chalk.hex("#FF5733")(file), "❌"]);
								console.warn(`Module from ${file} is missing 'data' or 'execute' property.`);
							}
						} catch (moduleError) {
							console.error(`Error loading command from file ${file}:`, moduleError);
							clientCommands.push([chalk.hex("#FF5733")(file), "❌"]);
						}
					}),
				);
			}),
		);

		console.log(
			table(clientCommands, {
				header: {
					alignment: "center",
					content: `Commands ${path.basename(directory)}`,
				},
				singleLine: true,
				columns: [{ width: 25 }, { width: 5, alignment: "center" }],
			}),
		);
	} catch (dirError) {
		console.error(`Error reading directory ${directory}:`, dirError);
	}
};

const loadEvents = async (directory, target) => {
	const clientEvents = [];

	const loadEventFiles = async (dir) => {
		const files = await fs.readdir(dir, { withFileTypes: true });

		await Promise.all(
			files.map(async (file) => {
				const filePath = path.join(dir, file.name);

				if (file.isDirectory()) {
					await loadEventFiles(filePath);
				} else if (file.isFile() && file.name.endsWith(".js")) {
					try {
						const event = require(path.resolve(filePath));
						clientEvents.push([chalk.hex("#E5C3FF")(file.name), "✅"]);
						const eventHandler = async (...args) => {
							try {
								await event.execute(...args);
							} catch (executeError) {
								console.error(`Error executing event ${event.name}:`, executeError);
							}
						};
						target[event.once ? "once" : "on"](event.name, eventHandler);
					} catch (loadError) {
						console.error(`Error loading event from file ${file.name}:`, loadError);
						clientEvents.push([chalk.hex("#FF5733")(file.name), "❌"]);
					}
				}
			}),
		);
	};

	await loadEventFiles(directory);

	console.log(
		table(clientEvents, {
			header: {
				alignment: "center",
				content: `Events ${path.basename(directory)}`,
			},
			singleLine: true,
			columns: [{ width: 25 }, { width: 5, alignment: "center" }],
		}),
	);
};

module.exports = {
	loadFiles,
	loadEvents,
};
