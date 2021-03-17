const config = require("../twitch-calls/config");
const { getTensorsFromBagOfWords } = require('machine-learning-shared');
const Stream = require('../mongoose/stream.model');
const User = require('../mongoose/user.model');
const tf = require('@tensorflow/tfjs');

const STREAMER = config.streamer;

const average = (nums) => {
    return nums.reduce((a, b) => (a + b)) / nums.length;
};

const getAllSentencesFromKeyAndBOW = async (data, key) => {
    const sentences = data.map(stream => {
        return stream[key];
    });
    return await getTensorsFromBagOfWords(sentences);
};

const normalizeString = (string) => {
    string = string.toLowerCase();
    const punctuationRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
    const numberRegex = /[0-9]/g;
    const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g
    string = string.replace(punctuationRegex, '');
    string = string.replace(emojiRegex, '');
    string = string.replace(numberRegex, '');
    return string;
};

const mapStreamData = (stream) => {
    return {
        'averageViewerCount': Number((average(stream.viewerCount)).toFixed(2)),
        'gameName': normalizeString(stream.gameName).replace(/\s/g, ''),
        'title': normalizeString(stream.title),
        'language': normalizeString(stream.language),
        'startingHour': Number((stream.startedAt.getHours() / 24).toFixed(2)),
        'startingMinute': Number((stream.startedAt.getMinutes() / 60).toFixed(2)),
        'day': Number((stream.startedAt.getDay() / 7).toFixed(2)),
    };
};

const splitIntoFeaturesAndLabels = (data, tensorList) => {
    const featureList = tensorList;
    const labelList = data.map(stream => {
        const average = stream.averageViewerCount;
        delete stream.averageViewerCount;
        return average;
    });
    return {
        'x_features': featureList,
        'y_labels': tf.tensor(labelList),
    }
};

const getAllItemsAndCreateTensor = (data, key) => {
    const items = data.map(stream => {
        return [stream[key]];
    });
    return tf.tensor(items);
};

const normalizeData = async (data) => {
    data = data.map(mapStreamData);
    const gameWordTensor = await getAllSentencesFromKeyAndBOW(data, 'gameName');
    const titleTensor = await getAllSentencesFromKeyAndBOW(data, 'title');
    const languageTensor = await getAllSentencesFromKeyAndBOW(data, 'language');
    const startingHourTensor = getAllItemsAndCreateTensor(data, 'startingHour');
    const startingMinuteTensor = getAllItemsAndCreateTensor(data, 'startingMinute');
    const startingDayTensor = getAllItemsAndCreateTensor(data, 'day');
    const tensorList = tf.concat([gameWordTensor, titleTensor, languageTensor, startingHourTensor, startingMinuteTensor, startingDayTensor ], 1);
    return splitIntoFeaturesAndLabels(data, tensorList);
};

const getData = async () => {
    const user = await User.findOne({
        'twitchName': STREAMER,
    });
    const streams = await Stream.find({
        'streamerId': user.twitchId,
    });
    return normalizeData(streams);
};

module.exports = {
    getData,
};
