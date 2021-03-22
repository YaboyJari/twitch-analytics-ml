var CronJob = require('cron').CronJob;
const {
    getStreamerInfo
} = require('./run-info-data');
const {
    parseToStreamSchema,
    parseToUserSchema,
} = require('./parse-data');

const Stream = require('../mongoose/stream.model');
const User = require('../mongoose/user.model');

const CRONINTERVAL = '*/5 * * * *';
const TIMEZONE = 'Europe/Brussels';

const runCronJob = async() => {
    const job = new CronJob(
        CRONINTERVAL,
        packageData,
        null,
        false,
        TIMEZONE,
    );
    job.start();
};

const packageData = async () => {
    const streamInfo = await getStreamerInfo();
    if (streamInfo) {
        streamInfo.forEach(streamer => {
            insertUserAndStream(streamer);
        });
    };
};

const insertUserAndStream = async (twitchInfo) => {
    try {
        let user;
        let stream;
        user = await User.findOne({
            'twitchId': twitchInfo.user_id,
        });
        if (!user) {
            console.log('User not found, inserting...');
            const mappedUserData = parseToUserSchema(twitchInfo);
            user = new User(mappedUserData);
            await user.save();
        };
        stream = await Stream.findOne({
            'streamerId': twitchInfo.user_id,
            'title': twitchInfo.title,
            'gameId': twitchInfo.game_id,
            'startedAt': twitchInfo.started_at,
        });
        if (!stream) {
            console.log('Stream not found, inserting...');
            const mappedStreamData = parseToStreamSchema(twitchInfo);
            stream = new Stream(mappedStreamData);
            if (stream.gameId && stream.gameName) {
                await stream.save();
            }
        } else {
            console.log('Stream found, adding view count...');
            stream.viewerCount.push(twitchInfo.viewer_count);
            await stream.save();
        };
    } catch (err) {
        console.log(err);
    };
};

module.exports = {
    runCronJob,
};