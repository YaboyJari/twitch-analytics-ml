const tf = require('@tensorflow/tfjs');
const {
    getData,
    filterUsers,
} = require('./normalize-data');
const Stream = require('../mongoose/stream.model');
const streamFixture = require('../test-data/stream-fixture');
const {
    mapStreamData,
    viewerArray,
} = require('./parse-data');

let myModel;
const learningRate = 0.003;
const epochs = 50;
const batchSize = 100;
const validationSplit = 0.2;

const createModel = (learningRate, shape) => {
    const model = tf.sequential();
    model.add(tf.layers.dense({
        units: 32,
        inputShape: [shape],
        useBias: true,
        activation: 'relu',
    }));
    model.add(tf.layers.dropout({
        rate: 0.2,
    }));
    model.add(tf.layers.dense({
        units: 5,
        activation: 'softmax',
    }));
    model.compile({
        optimizer: tf.train.adam(learningRate),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy'],
    });
    return model;
};

const trainModel = async (model, train_features, train_label, epochs, batchSize = null, validationSplit = 0.1) => {
    return await model.fit(train_features, train_label, {
        batchSize,
        epochs,
        shuffle: true,
        validationSplit,
    });
};

const castTensorToArray = (data) => {
    return Array.from(data.dataSync());
};

const getPercentArray = (predictions, labels) => {
    return labels.map((label, index) => {
        return {
            label,
            'prediction': (predictions[index] * 100).toFixed(2) + '%',
        }
    });
};

exports.runTestData = async () => {
    const mappedStream = streamFixture.map(mapStreamData);
    const tensorData = await getData(mappedStream);
    const predictions = myModel.predict(tensorData.x_features, {
        batchSize: batchSize,
    });
    const predictionData = castTensorToArray(predictions);
    console.log(streamFixture);
    console.log(getPercentArray(predictionData, viewerArray));
}

exports.startTraining = async () => {
    try {
        myModel = await tf.loadLayersModel('file://model/model.json');
    } catch (err) {
        if (!myModel) {
            const streams = await Stream.find();
            const mappedStreams = filterUsers(streams);
            let data = await getData(mappedStreams);
            const shape = data.x_features.shape[1];
            myModel = createModel(learningRate, shape);
            await trainModel(myModel, data.x_features, data.y_labels,
                epochs, batchSize, validationSplit);
            await myModel.save('file://model');
            console.log('Model trained!');
        };
    };
};