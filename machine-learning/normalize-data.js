const {
    getTensorsFromBagOfWords,
} = require('machine-learning-shared');
const {
    parseToVocSchema,
    parseLabelToCategory,
} = require('./parse-data');
const Stream = require('../mongoose/stream.model');
const Voc = require('../mongoose/voc.model');
const tf = require('@tensorflow/tfjs');

const average = (nums) => {
    return nums.reduce((a, b) => (a + b)) / nums.length;
};

const buildVoc = (features) => {
    let wordArray = [];
    features.forEach(feature => {
        const words = feature.split(' ');
        wordArray = wordArray.concat(words);
    });

    const vocSet = new Set(wordArray);

    const vocArray = Array.from(vocSet).sort();

    return vocArray;
};

const getAllSentencesFromKeyAndBOW = async (data, key) => {
    const sentences = data.map(stream => {
        return stream[key];
    });
    let sentenceVoc = buildVoc(sentences);
    const mappedVoc = parseToVocSchema(key, sentenceVoc);
    const searchedVoc = await Voc.findOne({
        'type': key,
    });
    if (searchedVoc) {
        sentenceVoc = searchedVoc.voc;
    } else {
        const voc = new Voc(mappedVoc);
        await voc.save();
    };
    return await getTensorsFromBagOfWords(sentences, sentenceVoc);
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
        'gameName': normalizeString(stream.gameName).replace(/\s/g, '').trim(),
        'title': normalizeString(stream.title).trim().replace(/ +(?= )/g, ''),
        'language': normalizeString(stream.language).trim(),
        'startingHour': Number((stream.startedAt.getHours() / 24).toFixed(2)),
        'startingMinute': Number((stream.startedAt.getMinutes() / 60).toFixed(2)),
        'day': Number((stream.startedAt.getDay() / 7).toFixed(2)),
    };
};

const splitIntoFeaturesAndLabels = (data, tensorList) => {
    const featureList = tensorList;
    const labelList = data.map(stream => {
        const average = parseLabelToCategory(stream.averageViewerCount);
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
    const gameWordTensor = await getAllSentencesFromKeyAndBOW(data, 'gameName');
    const titleTensor = await getAllSentencesFromKeyAndBOW(data, 'title');
    const languageTensor = await getAllSentencesFromKeyAndBOW(data, 'language');
    const startingHourTensor = getAllItemsAndCreateTensor(data, 'startingHour');
    const startingMinuteTensor = getAllItemsAndCreateTensor(data, 'startingMinute');
    const startingDayTensor = getAllItemsAndCreateTensor(data, 'day');
    const tensorList = tf.concat([gameWordTensor, titleTensor, languageTensor, startingHourTensor, startingMinuteTensor, startingDayTensor], 1);
    return splitIntoFeaturesAndLabels(data, tensorList);
};

const filterOutliers = (streams) => {
    const q1 = streams[Math.floor((streams.length / 4))];
    const q3 = streams[Math.ceil((streams.length * (3 / 4)))];
    const iqr = q3.averageViewerCount - q1.averageViewerCount;

    const maxValue = q3.averageViewerCount + iqr * 1.5;
    const minValue = q1.averageViewerCount - iqr * 1.5;

    return streams.filter((x) => {
        return (x.averageViewerCount <= maxValue) && (x.averageViewerCount >= minValue);
    });
};

const filterUsers = (streams) => {
    streams = streams.map(mapStreamData);
    streams.sort((a, b) => {
        return a.averageViewerCount - b.averageViewerCount;
    });
    return filterOutliers(streams);
};

const getData = async () => {
    const streams = await Stream.find();
    let filteredStreams = filterUsers(streams);
    return await normalizeData(filteredStreams);
};

module.exports = {
    getData,
};