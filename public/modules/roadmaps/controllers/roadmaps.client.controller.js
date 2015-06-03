'use strict';

// Roadmaps controller
angular.module('roadmaps').controller('RoadmapsController', ['$scope', '$state','$stateParams', '$location', 'Authentication', 'Roadmaps', 'Projects', 'SimulationService', 'HeatmapService',
    function ($scope, $state, $stateParams, $location, Authentication, Roadmaps, Projects, SimulationService, HeatmapService) {
        $scope.authentication = Authentication;

        $scope.epicName = '';
        //$scope.startDate = new Date();
        $scope.heatmapVisible = false;

        $scope.datePickerOpen = false;


        $scope.cellWidth = 3.5;
        $scope.labelWidth = 190;
        $scope.simulationNumber = 10000;
        $scope.showExpected = false;
        $scope.showInterval = true;




        $scope.openDatePicker = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.datePickerOpen = true;
        };

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


        $scope.removeEpic = function(removedEpic) {
            for (var i=0; i<$scope.roadmap.epics.length; i++) {
                var epic = $scope.roadmap.epics[i];
                if(removedEpic._id === epic._id) {
                    $scope.roadmap.epics.splice(i, 1);
                }
            }
           $scope.roadmap.$update();
        };

        $scope.remove = function () {
            var projectId = $scope.roadmap.projectId;
            $scope.roadmap.$remove(function () {
                $location.path('projects/' + projectId);
            });

        };


        // Update existing Roadmap
        $scope.update = function () {

            $scope.roadmap.$update(function () {

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
            }, function() {
                //$scope.roadmap.start = new Date($scope.roadmap.start);
                $scope.project = Projects.get({
                   projectId: $scope.roadmap.projectId
                });
            });
        };

        // Find existing Roadmap
        $scope.findById = function (id) {
            $scope.roadmap = Roadmaps.get({
                roadmapId: id
            });
        };

        $scope.run = function () {

            $scope.update();
            SimulationService.run($scope.roadmap, $scope.simulationNumber);
            HeatmapService.drawHeatmap(SimulationService.d3Data, $scope.labelWidth, $scope.cellWidth, $scope.showExpected, $scope.showInterval);

            this.heatmapVisible = true;
        };


    }
]);
