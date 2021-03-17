const {
    getToken,
} = require('../twitch-calls/token-credentials');
const {
    getStreamInfo,
} = require('../twitch-calls/get-stream-info');
const config = require("../config");

const STREAMER = config.streamer;

const getStreamerInfo = async () => {
    token = await getToken();
    token = JSON.parse(token).access_token;
    const streamInfo = JSON.parse(await getStreamInfo(STREAMER, token)).data[0];
    return streamInfo;
};

module.exports = {
    getStreamerInfo,
}