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
}

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
};