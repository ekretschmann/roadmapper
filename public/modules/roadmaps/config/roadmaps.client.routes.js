'use strict';

//Setting up route
angular.module('roadmaps').config(['$stateProvider',
	function($stateProvider) {
		// Roadmaps state routing
		$stateProvider.
		state('listRoadmaps', {
			url: '/roadmaps',
			templateUrl: 'modules/roadmaps/views/list-roadmaps.client.view.html'
		}).
		state('createRoadmap', {
			url: '/roadmaps/create',
			templateUrl: 'modules/roadmaps/views/create-roadmap.client.view.html'
		}).
		state('viewRoadmap', {
			url: '/roadmaps/:roadmapId',
			templateUrl: 'modules/roadmaps/views/view-roadmap.client.view.html'
		}).
		state('editRoadmap', {
			url: '/roadmaps/:roadmapId/edit',
			templateUrl: 'modules/roadmaps/views/edit-roadmap.client.view.html'
		});
	}
]);