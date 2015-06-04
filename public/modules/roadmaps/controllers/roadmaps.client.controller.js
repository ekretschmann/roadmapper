'use strict';

/* global moment */
angular.module('roadmaps').controller('RoadmapsController', ['$scope', '$modal','$state','$stateParams', '$location', 'Authentication', 'Roadmaps', 'Projects', 'SimulationService', 'HeatmapService',
    function ($scope, $modal, $state, $stateParams, $location, Authentication, Roadmaps, Projects, SimulationService, HeatmapService) {
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
        $scope.locked = false;




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

            if ($scope.locked) {
                return;
            }


            for (var i=0; i<$scope.roadmap.epics.length; i++) {
                var epic = $scope.roadmap.epics[i];
                if(removedEpic._id === epic._id) {
                    $scope.roadmap.epics.splice(i, 1);
                }
            }
           $scope.roadmap.$update();
        };


        $scope.lockPopup = function(size) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'lockRoadmapModal.html',
                controller: 'LockModalCtrl',
                size: size,
                resolve: {
                    roadmap: function () {
                        return $scope.roadmap;
                    }
                }
            });


        };

        $scope.removePopup = function(size) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'removeRoadmapModal.html',
                controller: 'DeleteModalCtrl',
                size: size,
                resolve: {
                    roadmap: function () {
                        return $scope.roadmap;
                    }
                }
            });


        };

        $scope.copyPopup = function(size) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'copyRoadmapModal.html',
                controller: 'CopyModalCtrl',
                size: size,
                resolve: {
                    roadmap: function () {
                        return $scope.roadmap;
                    },
                    newName: function() {
                        return $scope.copyName;
                    }
                }
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
                $scope.locked = new Date($scope.roadmap.locked).getTime() !== 0;
                $scope.project = Projects.get({
                   projectId: $scope.roadmap.projectId
                });
                if ($scope.locked) {
                    $scope.run();
                }
            });
        };

        // Find existing Roadmap
        $scope.findById = function (id) {
            $scope.roadmap = Roadmaps.get({
                roadmapId: id
            }, function() {
                $scope.locked = new Date($scope.roadmap.locked).getTime() !== 0;

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


angular.module('roadmaps').controller('CopyModalCtrl', function ($scope, $modalInstance, $location, Roadmaps, Projects, roadmap) {

    $scope.roadmap = roadmap;
    $scope.newName = 'Roadmap '+ moment().format('MMM Do YYYY');

    $scope.ok = function () {




        var newMap = new Roadmaps({
            name: $scope.newName
        });

        newMap.start = $scope.roadmap.start;
        newMap.projectId = $scope.roadmap.projectId;
        newMap.estimationModel = $scope.roadmap.estimationModel;
        newMap.epics = $scope.roadmap.epics;

        newMap.$save(function (response) {

            Projects.get({
                projectId: $scope.roadmap.projectId
            }, function(project) {
                project.roadmaps.push(response._id);
                project.$update();

                $location.path('projects/' + response.projectId);

            });

        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });


        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('roadmaps').controller('DeleteModalCtrl', function ($scope, $modalInstance, $location, roadmap) {

    $scope.roadmap = roadmap;

    $scope.ok = function () {
        var projectId = $scope.roadmap.projectId;
        $scope.roadmap.$remove(function () {
            $location.path('projects/' + projectId);
        });
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('roadmaps').controller('LockModalCtrl', function ($scope, $modalInstance, $location, roadmap) {

    $scope.roadmap = roadmap;

    $scope.ok = function () {
        $scope.roadmap.locked = Date.now();

        $scope.roadmap.$update();
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
