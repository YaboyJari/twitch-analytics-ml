const {
    getToken,
} = require('../twitch-calls/token-credentials');
const {
    getDutchStreams,
} = require('../twitch-calls/get-dutch-streamers');
const {
    getFollowerIds,
} = require('../twitch-calls/get-followers-ids');

const getStreamerInfo = async () => {
    let token = await getToken();
    token = JSON.parse(token).access_token;
    let streams = await getDutchStreams(token);
    streams = JSON.parse(streams).data;
    const streamerIds = streams.map(info => {
        return info.user_id;
    });
    let followerCount = [];
    for(x = 0; x < streamerIds.length; x++) {
        let followers = await getFollowerIds(streamerIds[x], token);
        followers = JSON.parse(followers).total;
        followerCount.push(followers);
    };
    streams = streams.map((stream, index) => {
        stream.followerCount = followerCount[index];
        return stream;
    });
    return streams;
};

module.exports = {
    getStreamerInfo,
}