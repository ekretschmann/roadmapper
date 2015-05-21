'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var roadmaps = require('../../app/controllers/roadmaps.server.controller');

	// Roadmaps Routes
	app.route('/roadmaps')
		.get(roadmaps.list)
		.post(users.requiresLogin, roadmaps.create);

	app.route('/roadmaps/:roadmapId')
		.get(roadmaps.read)
		.put(users.requiresLogin, roadmaps.hasAuthorization, roadmaps.update)
		.delete(users.requiresLogin, roadmaps.hasAuthorization, roadmaps.delete);

	// Finish by binding the Roadmap middleware
	app.param('roadmapId', roadmaps.roadmapByID);
};
