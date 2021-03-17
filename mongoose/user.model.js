'use strict';

const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  twitchId: { type: String, required: true },
  twitchName: { type: String, required: true },
});

module.exports = mongoose.model('User', userDataSchema);
