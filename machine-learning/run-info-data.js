const {
    getToken,
} = require('../twitch-calls/token-credentials');
const {
    getDutchStreams,
} = require('../twitch-calls/get-dutch-streamers');

const getStreamerInfo = async () => {
    let token = await getToken();
    token = JSON.parse(token).access_token;
    const test = await getDutchStreams(token);
    return JSON.parse(test).data;
};

module.exports = {
    getStreamerInfo,
}