'use strict';

const mongoose = require('mongoose');

const database = {
  uri: 'mongodb://localhost:27017/twitch-stats',
  options: {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  // Enable mongoose debug mode
  debug: 'true',
};

// Initialize Mongoose
const connect = async () => {
  console.log(`Connecting to MongoDB ${database.uri}...`);
  try {
    await mongoose.connect(
      database.uri,
      database.options,
    );
  } catch (err) {
    console.log(`Could not connect to MongoDB!\n${err.stack}`);
    throw err;
  }
};

const disconnect = async () => {
  console.log('Disconnecting from MongoDB...');
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (err) {
    console.log(`Disconnecting from mongoDB threw an error\n${err.stack}`);
  }
};

module.exports = { connect, disconnect };
