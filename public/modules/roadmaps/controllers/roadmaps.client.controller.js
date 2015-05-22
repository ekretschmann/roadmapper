'use strict';

// Roadmaps controller
angular.module('roadmaps').controller('RoadmapsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Roadmaps',
    function ($scope, $stateParams, $location, Authentication, Roadmaps) {
        $scope.authentication = Authentication;

        // Create new Roadmap
        $scope.create = function () {
            // Create new Roadmap object
            var roadmap = new Roadmaps({
                name: this.name
            });

            // Redirect after save
            roadmap.$save(function (response) {
                $location.path('roadmaps/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function () {
            var projectId = $scope.roadmap.projectId;
            $scope.roadmap.$remove(function () {
                $location.path('projects/' + projectId);
            });

        };

        //// Remove existing Roadmap
        //$scope.remove = function(roadmap) {
        //	if ( roadmap ) {
        //		roadmap.$remove();
        //
        //		for (var i in $scope.roadmaps) {
        //			if ($scope.roadmaps [i] === roadmap) {
        //				$scope.roadmaps.splice(i, 1);
        //			}
        //		}
        //	} else {
        //		$scope.roadmap.$remove(function() {
        //			$location.path('roadmaps');
        //		});
        //	}
        //};

        // Update existing Roadmap
        $scope.update = function () {
            var roadmap = $scope.roadmap;

            roadmap.$update(function () {
                $location.path('roadmaps/' + roadmap._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Roadmaps
        $scope.find = function () {
            $scope.roadmaps = Roadmaps.query();
        };

        // Find existing Roadmap
        $scope.findOne = function () {
            $scope.roadmap = Roadmaps.get({
                roadmapId: $stateParams.roadmapId
            });
        };

        // Find existing Roadmap
        $scope.findById = function (id) {
            $scope.roadmap = Roadmaps.get({
                roadmapId: id
            });
        };
    }
]);
