const { parentPort, workerData } = require('worker_threads');
const { MusicSearchCard } = require('./MusicSearchCard');

async function buildImage(searchPlayer, query) {
    const card = new MusicSearchCard()
        .setPlayers(searchPlayer)
        .setTitle(query);

    const buffer = await card.build({ format: 'png' });
    return buffer;
}

buildImage(workerData.searchPlayer, workerData.query)
    .then(buffer => {
        parentPort.postMessage(buffer.buffer); // Send as ArrayBuffer
    })
    .catch(error => {
        console.error('Error in worker:', error);
        process.exit(1);
    });
