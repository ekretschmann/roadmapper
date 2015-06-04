'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Roadmap Schema
 */
var RoadmapSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Roadmap name',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    start: {
        type: Date,
        default: Date.now
    },
    estimationModel: {
        type: String,
        default: 'normal'
    },
    locked: {
        type: Date,
        default: 0
    },
    epics: {
        type: [{
            name: {
                type: String,
                default: '',
                required: 'Please fill Reward name',
                trim: true
            },
            estimated: {
                type: Number,
                default: 0
            },
            deviation: {
                type: Number,
                default: 0
            },
            low: {
                type: Number,
                default: 0
            },
            expected: {
                type: Number,
                default: 0
            },
            high: {
                type: Number,
                default: 0
            }
        }],
        default: []
    },
    projectId: {
        type: Schema.ObjectId
    }
});

mongoose.model('Roadmap', RoadmapSchema);
