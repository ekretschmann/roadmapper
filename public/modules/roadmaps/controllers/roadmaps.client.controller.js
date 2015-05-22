'use strict';

// Roadmaps controller
angular.module('roadmaps').controller('RoadmapsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Roadmaps',
    function ($scope, $stateParams, $location, Authentication, Roadmaps) {
        $scope.authentication = Authentication;

        $scope.epicName = '';


        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return true;
            },
            itemMoved: function (event) {

            },
            orderChanged: function (event) {
                // $scope.project.roadmaps = [];
                $scope.roadmap.$update(function (response) {
                    $scope.message = 'Changed Priorities';
                }, function (errorResponse) {
                    console.log(errorResponse);
                });
            },
            containment: '#board'
        };


        $scope.addEpic = function () {

            $scope.roadmap.epics.push({name: $scope.epicName, estimated: 0, deviation: 0});
            $scope.roadmap.$update(function (response) {
                $scope.epicName = '';
            }, function (errorResponse) {
                console.log(errorResponse);
            });
        };


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



        // Update existing Roadmap
        $scope.update = function () {
            var roadmap = $scope.roadmap;

            roadmap.$update(function () {
                //$location.path('roadmaps/' + roadmap._id);
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
