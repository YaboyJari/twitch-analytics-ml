const size = require("../enums/size");

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

const parseToVocSchema = (averageViewers, key, voc, size) => {
    return {
        'averageViewers': averageViewers,
        'type': key,
        'size': size,
        'voc': voc,
    };
}

module.exports = {
    parseToStreamSchema,
    parseToUserSchema,
    parseToVocSchema,
};