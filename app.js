require('@tensorflow/tfjs-node');
const express = require('express');
const {
    connect,
} = require('./mongoose/mongoose-initializer')
const {
    runCronJob,
} = require('./machine-learning/create-data');
const {
    getData,
} = require('./machine-learning/normalize-data');
const { startTraining } = require('./machine-learning/model');
const PORT = 3000;

(async () => {
    await connect();
    console.log('Starting server...');
    const app = express();
    await app.listen(PORT);
    console.log(`Server started. Listening on port ${PORT}`);
    await runCronJob();
    // await startTraining();
})();