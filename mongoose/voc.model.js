'use strict';

const mongoose = require('mongoose');

const vocDataSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['gameName', 'title', 'language'],
        required: true,
    },
    voc: {
        type: [String],
        required: true,
    },
});

module.exports = mongoose.model('Voc', vocDataSchema);