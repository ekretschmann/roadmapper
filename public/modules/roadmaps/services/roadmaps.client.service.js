'use strict';

//Roadmaps service used to communicate Roadmaps REST endpoints
angular.module('roadmaps').factory('Roadmaps', ['$resource',
	function($resource) {
		return $resource('roadmaps/:roadmapId', { roadmapId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);