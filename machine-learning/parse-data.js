const viewerArray = ['Between 0 and 10 viewers', 'Between 10 and 20 viewers', 'Between 20 and 30 viewers', 'Between 40 and 50 viewers', '50+ viewers'];

const average = (nums) => {
    return nums.reduce((a, b) => (a + b)) / nums.length;
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

const parseToUserSchema = (twitchInfo) => {
    return {
        'twitchId': twitchInfo.user_id,
        'twitchName': twitchInfo.user_name,
    }
};

const parseToStreamSchema = (twitchInfo) => {
    return {
        'streamerId': twitchInfo.user_id,
        'gameId': twitchInfo.game_id,
        'gameName': twitchInfo.game_name,
        'title': twitchInfo.title,
        'viewerCount': [twitchInfo.viewer_count],
        'language': twitchInfo.language,
        'startedAt': twitchInfo.started_at,
    }
};

const parseToVocSchema = (key, voc) => {
    return {
        'type': key,
        'voc': voc,
    };
};

const mapStreamData = (stream) => {
    return {
        'averageViewerCount': stream.viewerCount ? Number((average(stream.viewerCount)).toFixed(2)) : null,
        'gameName': normalizeString(stream.gameName).replace(/\s/g, '').trim(),
        'title': normalizeString(stream.title).trim().replace(/ +(?= )/g, ''),
        'language': normalizeString(stream.language).trim(),
        'startingHour': Number((stream.startedAt.getHours() / 24).toFixed(2)),
        'startingMinute': Number((stream.startedAt.getMinutes() / 60).toFixed(2)),
        'day': Number((stream.startedAt.getDay() / 7).toFixed(2)),
    };
};

const parseLabelToCategory = (label) => {
    if (label > 0 && label <= 10) {
        return 0;
    } else if (label > 10 && label <= 20) {
        return 1;
    } else if (label > 20 && label <= 30) {
        return 2;
    } else if (label > 30 && label <= 40) {
        return 3;
    } else {
        return 4;
    };
};

module.exports = {
    parseToStreamSchema,
    parseToUserSchema,
    parseToVocSchema,
    parseLabelToCategory,
    mapStreamData,
    viewerArray,
};