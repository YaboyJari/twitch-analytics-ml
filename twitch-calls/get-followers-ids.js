const request = require("request");
const config = require("./config");

const getFollowerIds = async (id, bearerToken) => {
    return new Promise((resolve, reject) => {
        request({
                method: "GET",
                uri: `https://api.twitch.tv/helix/users/follows?to_id=${id}`,
                headers: {
                    'Client-Id': config.clientID,
                    'Authorization': `Bearer ${bearerToken}`,
                },
            },

            // callback
            (error, response, body) => {
                resolve(body);
            }
        );
    });
};

module.exports = {
    getFollowerIds,
};