const tf = require('@tensorflow/tfjs');
const {
    getData,
} = require('./normalize-data');
const sizeEnum = require('../enums/size');

const learningRate = 0.005;
const epochs = 50;
const batchSize = 10;
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
        units: 1,
        activation: 'relu',
    }));
    model.compile({
        optimizer: tf.train.adam(learningRate),
        loss: tf.losses.meanSquaredError,
        metrics: ['accuracy', 'mse'],
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

exports.startTraining = async () => {
    let data = await getData();
    console.log(data.length)
    for(x = 0; x < data.length; x++) {
        const shape = data[x].x_features.shape[1];
        const myModel = createModel(learningRate, shape);
        await trainModel(myModel, data[x].x_features, data[x].y_labels,
            epochs, batchSize, validationSplit);
        await myModel.save('file://models/model-' + sizeEnum[x]);
        console.log(sizeEnum[x] + ' model trained!');
    };
    console.log('Models trained!');
};