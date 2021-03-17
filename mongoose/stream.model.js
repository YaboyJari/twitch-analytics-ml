'use strict';

const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  streamerId: { type: String, required: true },
  gameId: { type: String, required: true },
  gameName: { type: String, required: true },
  title: { type: String, required: true },
  viewerCount: { type: [Number], required: true },
  language: { type: String, required: true },
  startedAt: { type: Date, required: true },
});

module.exports = mongoose.model('Stream', userDataSchema);
