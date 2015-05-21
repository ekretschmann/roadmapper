'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Roadmap = mongoose.model('Roadmap'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, roadmap;

/**
 * Roadmap routes tests
 */
describe('Roadmap CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Roadmap
		user.save(function() {
			roadmap = {
				name: 'Roadmap Name'
			};

			done();
		});
	});

	it('should be able to save Roadmap instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roadmap
				agent.post('/roadmaps')
					.send(roadmap)
					.expect(200)
					.end(function(roadmapSaveErr, roadmapSaveRes) {
						// Handle Roadmap save error
						if (roadmapSaveErr) done(roadmapSaveErr);

						// Get a list of Roadmaps
						agent.get('/roadmaps')
							.end(function(roadmapsGetErr, roadmapsGetRes) {
								// Handle Roadmap save error
								if (roadmapsGetErr) done(roadmapsGetErr);

								// Get Roadmaps list
								var roadmaps = roadmapsGetRes.body;

								// Set assertions
								(roadmaps[0].user._id).should.equal(userId);
								(roadmaps[0].name).should.match('Roadmap Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Roadmap instance if not logged in', function(done) {
		agent.post('/roadmaps')
			.send(roadmap)
			.expect(401)
			.end(function(roadmapSaveErr, roadmapSaveRes) {
				// Call the assertion callback
				done(roadmapSaveErr);
			});
	});

	it('should not be able to save Roadmap instance if no name is provided', function(done) {
		// Invalidate name field
		roadmap.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roadmap
				agent.post('/roadmaps')
					.send(roadmap)
					.expect(400)
					.end(function(roadmapSaveErr, roadmapSaveRes) {
						// Set message assertion
						(roadmapSaveRes.body.message).should.match('Please fill Roadmap name');
						
						// Handle Roadmap save error
						done(roadmapSaveErr);
					});
			});
	});

	it('should be able to update Roadmap instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roadmap
				agent.post('/roadmaps')
					.send(roadmap)
					.expect(200)
					.end(function(roadmapSaveErr, roadmapSaveRes) {
						// Handle Roadmap save error
						if (roadmapSaveErr) done(roadmapSaveErr);

						// Update Roadmap name
						roadmap.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Roadmap
						agent.put('/roadmaps/' + roadmapSaveRes.body._id)
							.send(roadmap)
							.expect(200)
							.end(function(roadmapUpdateErr, roadmapUpdateRes) {
								// Handle Roadmap update error
								if (roadmapUpdateErr) done(roadmapUpdateErr);

								// Set assertions
								(roadmapUpdateRes.body._id).should.equal(roadmapSaveRes.body._id);
								(roadmapUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Roadmaps if not signed in', function(done) {
		// Create new Roadmap model instance
		var roadmapObj = new Roadmap(roadmap);

		// Save the Roadmap
		roadmapObj.save(function() {
			// Request Roadmaps
			request(app).get('/roadmaps')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Roadmap if not signed in', function(done) {
		// Create new Roadmap model instance
		var roadmapObj = new Roadmap(roadmap);

		// Save the Roadmap
		roadmapObj.save(function() {
			request(app).get('/roadmaps/' + roadmapObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', roadmap.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Roadmap instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roadmap
				agent.post('/roadmaps')
					.send(roadmap)
					.expect(200)
					.end(function(roadmapSaveErr, roadmapSaveRes) {
						// Handle Roadmap save error
						if (roadmapSaveErr) done(roadmapSaveErr);

						// Delete existing Roadmap
						agent.delete('/roadmaps/' + roadmapSaveRes.body._id)
							.send(roadmap)
							.expect(200)
							.end(function(roadmapDeleteErr, roadmapDeleteRes) {
								// Handle Roadmap error error
								if (roadmapDeleteErr) done(roadmapDeleteErr);

								// Set assertions
								(roadmapDeleteRes.body._id).should.equal(roadmapSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Roadmap instance if not signed in', function(done) {
		// Set Roadmap user 
		roadmap.user = user;

		// Create new Roadmap model instance
		var roadmapObj = new Roadmap(roadmap);

		// Save the Roadmap
		roadmapObj.save(function() {
			// Try deleting Roadmap
			request(app).delete('/roadmaps/' + roadmapObj._id)
			.expect(401)
			.end(function(roadmapDeleteErr, roadmapDeleteRes) {
				// Set message assertion
				(roadmapDeleteRes.body.message).should.match('User is not logged in');

				// Handle Roadmap error error
				done(roadmapDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Roadmap.remove().exec();
		done();
	});
});