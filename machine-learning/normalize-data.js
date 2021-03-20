const {
    getTensorsFromBagOfWords,
} = require('machine-learning-shared');
const {
    parseToVocSchema,
    parseLabelToCategory,
    mapStreamData,
} = require('./parse-data');
const Voc = require('../mongoose/voc.model');
const tf = require('@tensorflow/tfjs');

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
    const followerTensor = getAllItemsAndCreateTensor(data, 'followerCount');
    const tensorList = tf.concat([gameWordTensor, titleTensor, languageTensor, startingHourTensor, startingMinuteTensor, startingDayTensor, followerTensor], 1);
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

const normalize = (value, min, max) => {
    if (min === undefined || max === undefined) {
        return value;
    }
    return (value - min) / (max - min);
};

const normalizeFollowerCount = (streams) => {
    streamFollowers = streams.map(stream => {
        return stream.followerCount;
    });
    const min = Math.min.apply(null, streamFollowers);
    const max = Math.max.apply(null, streamFollowers);
    return streams.map(stream => {
        stream.followerCount = normalize(stream.followerCount, min, max);
        return stream;
    });
};

const filterUsers = (streams) => {
    streams = normalizeFollowerCount(streams);
    streams = streams.map(mapStreamData);
    streams.sort((a, b) => {
        return a.averageViewerCount - b.averageViewerCount;
    });
    return filterOutliers(streams);
};

const getData = async (streams) => {
    return await normalizeData(streams);
};

module.exports = {
    getData,
    filterUsers,
};