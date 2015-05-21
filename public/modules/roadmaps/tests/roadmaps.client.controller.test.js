'use strict';

(function() {
	// Roadmaps Controller Spec
	describe('Roadmaps Controller Tests', function() {
		// Initialize global variables
		var RoadmapsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Roadmaps controller.
			RoadmapsController = $controller('RoadmapsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Roadmap object fetched from XHR', inject(function(Roadmaps) {
			// Create sample Roadmap using the Roadmaps service
			var sampleRoadmap = new Roadmaps({
				name: 'New Roadmap'
			});

			// Create a sample Roadmaps array that includes the new Roadmap
			var sampleRoadmaps = [sampleRoadmap];

			// Set GET response
			$httpBackend.expectGET('roadmaps').respond(sampleRoadmaps);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.roadmaps).toEqualData(sampleRoadmaps);
		}));

		it('$scope.findOne() should create an array with one Roadmap object fetched from XHR using a roadmapId URL parameter', inject(function(Roadmaps) {
			// Define a sample Roadmap object
			var sampleRoadmap = new Roadmaps({
				name: 'New Roadmap'
			});

			// Set the URL parameter
			$stateParams.roadmapId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/roadmaps\/([0-9a-fA-F]{24})$/).respond(sampleRoadmap);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.roadmap).toEqualData(sampleRoadmap);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Roadmaps) {
			// Create a sample Roadmap object
			var sampleRoadmapPostData = new Roadmaps({
				name: 'New Roadmap'
			});

			// Create a sample Roadmap response
			var sampleRoadmapResponse = new Roadmaps({
				_id: '525cf20451979dea2c000001',
				name: 'New Roadmap'
			});

			// Fixture mock form input values
			scope.name = 'New Roadmap';

			// Set POST response
			$httpBackend.expectPOST('roadmaps', sampleRoadmapPostData).respond(sampleRoadmapResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Roadmap was created
			expect($location.path()).toBe('/roadmaps/' + sampleRoadmapResponse._id);
		}));

		it('$scope.update() should update a valid Roadmap', inject(function(Roadmaps) {
			// Define a sample Roadmap put data
			var sampleRoadmapPutData = new Roadmaps({
				_id: '525cf20451979dea2c000001',
				name: 'New Roadmap'
			});

			// Mock Roadmap in scope
			scope.roadmap = sampleRoadmapPutData;

			// Set PUT response
			$httpBackend.expectPUT(/roadmaps\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/roadmaps/' + sampleRoadmapPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid roadmapId and remove the Roadmap from the scope', inject(function(Roadmaps) {
			// Create new Roadmap object
			var sampleRoadmap = new Roadmaps({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Roadmaps array and include the Roadmap
			scope.roadmaps = [sampleRoadmap];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/roadmaps\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleRoadmap);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.roadmaps.length).toBe(0);
		}));
	});
}());