const request = require("request");
const config = require("./config");

const getDutchStreams = async (bearerToken) => {
  return new Promise((resolve, reject) => {
    request({
        method: "GET",
        uri: `https://api.twitch.tv/helix/streams?language=nl&first=100`,
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
    getDutchStreams,
};