const {
    getToken,
} = require('../twitch-calls/token-credentials');
const {
    getDutchStreams,
} = require('../twitch-calls/get-dutch-streamers');

const getStreamerInfo = async () => {
    let token = await getToken();
    token = JSON.parse(token).access_token;
    let streams = await getDutchStreams(token);
    streams = JSON.parse(streams).data;
    return streams;
};

module.exports = {
    getStreamerInfo,
}