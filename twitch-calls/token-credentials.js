const request = require("request");
const config = require("./config");

const getToken = async () => {
  return new Promise((resolve, reject) => {
    request({
        method: "POST",
        uri: `https://id.twitch.tv/oauth2/token`,
        form: {
          client_id: config.clientID,
          client_secret: config.clientToken,
          grant_type: "client_credentials",
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
  getToken,
};