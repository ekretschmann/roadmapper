'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Roadmap = mongoose.model('Roadmap'),
	_ = require('lodash');

/**
 * Create a Roadmap
 */
exports.create = function(req, res) {
	var roadmap = new Roadmap(req.body);
	roadmap.user = req.user;

	roadmap.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roadmap);
		}
	});
};

/**
 * Show the current Roadmap
 */
exports.read = function(req, res) {
	res.jsonp(req.roadmap);
};

/**
 * Update a Roadmap
 */
exports.update = function(req, res) {
	var roadmap = req.roadmap ;

	roadmap = _.extend(roadmap , req.body);

	roadmap.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roadmap);
		}
	});
};

/**
 * Delete an Roadmap
 */
exports.delete = function(req, res) {
	var roadmap = req.roadmap ;

	roadmap.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roadmap);
		}
	});
};

/**
 * List of Roadmaps
 */
exports.list = function(req, res) { 
	Roadmap.find().sort('-created').populate('user', 'displayName').exec(function(err, roadmaps) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roadmaps);
		}
	});
};

/**
 * Roadmap middleware
 */
exports.roadmapByID = function(req, res, next, id) { 
	Roadmap.findById(id).populate('user', 'displayName').exec(function(err, roadmap) {
		if (err) return next(err);
		if (! roadmap) return next(new Error('Failed to load Roadmap ' + id));
		req.roadmap = roadmap ;
		next();
	});
};

/**
 * Roadmap authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.roadmap.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
