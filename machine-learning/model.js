const tf = require('@tensorflow/tfjs');
const {
    getData,
} = require('./normalize-data');

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
    try {
        myModel = await tf.loadLayersModel('file://model/model.json');
    } catch (err) {
        if (!myModel) {
            let data = await getData();
            const shape = data.x_features.shape[1];
            myModel = createModel(learningRate, shape);
            await trainModel(myModel, data.x_features, data.y_labels,
                epochs, batchSize, validationSplit);
            await myModel.save('file://model');
            console.log('Model trained!');
        };
    };
};