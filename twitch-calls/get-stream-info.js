const request = require("request");
const config = require("./config");

const getStreamInfo = async (username, bearerToken) => {
  return new Promise((resolve, reject) => {
    request({
        method: "GET",
        uri: `https://api.twitch.tv/helix/streams?user_login=${username}`,
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
  getStreamInfo,
};