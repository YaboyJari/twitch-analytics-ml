'use strict';

const mongoose = require('mongoose');

const vocDataSchema = new mongoose.Schema({
    averageViewers: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['gameName', 'title', 'language'],
        required: true,
    },
    size: {
        type: String,
        enum: ['tinyStream', 'smallStream', 'mediumStream', 'bigStream', 'biggestStream'],
        required: true,
    },
    voc: {
        type: [String],
        required: true,
    },
});

module.exports = mongoose.model('Voc', vocDataSchema);