'use strict';

// Roadmaps controller
angular.module('roadmaps').controller('RoadmapsController', ['$scope', '$state','$stateParams', '$location', 'Authentication', 'Roadmaps', 'Projects', 'SimulationService',
    function ($scope, $state, $stateParams, $location, Authentication, Roadmaps, Projects, SimulationService) {
        $scope.authentication = Authentication;

        $scope.epicName = '';
        $scope.heatmapVisible = false;



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
                    $scope.roadmap.epics.splice(i, i);
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

        //
        //$scope.$watch('roadmap', function(){
        //    $scope.update();
        //}, true);

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


            SimulationService.run($scope.roadmap.epics);
            //
            //var result = [];
            //for(var x=0; x<1000;x++) {
            //    var map = [];
            //
            //    for(var j=0; j<$scope.roadmap.epics.length;j++) {
            //        var epic= $scope.roadmap.epics[j];
            //        map.push({
            //            active: false,
            //            val: Math.max(1, Math.round($scope.random(epic.estimated, epic.deviation)))
            //        });
            //    }
            //
            //
            //    var total = 0;
            //    var originals = [];
            //    for(j=0; j<map.length;j++) {
            //        total += map[j].val;
            //        originals.push(map[j].val);
            //    }
            //
            //
            //    map[0].active = true;
            //
            //
            //    var deliveries = [];
            //
            //
            //    for (var i = 0; i <= total; i++) {
            //
            //
            //        var activeEpics = 0;
            //        for (j = 0; j < map.length; j++) {
            //            if (map[j].active) {
            //                activeEpics++;
            //            }
            //        }
            //
            //
            //        for (var k = 0; k < map.length; k++) {
            //            var item = map[k];
            //            if (item.active) {
            //                item.val -= (1.0 / activeEpics);
            //                if (item.val < 0) {
            //                    item.active = false;
            //                    deliveries[k] = i;
            //                }
            //                if (item.val < 0.5 * originals[k]) {
            //                    if (map.length > k + 1) {
            //                        if (map[k + 1].val > 0) {
            //                            map[k + 1].active = true;
            //                        }
            //                    }
            //                }
            //            }
            //        }
            //
            //
            //    }
            //
            //    //console.log(total+deliveries);
            //
            //    for (i = 0; i<deliveries.length; i++) {
            //        var index = i+'-'+deliveries[i];
            //        if (result[index]) {
            //
            //            result[index] += 1;
            //        } else {
            //            result[index] = 1;
            //        }
            //    }
            //}
            //
            //
            //var data = [];
            //var maxRow = 0;
            //var maxCol = 0;
            //Object.keys(result).forEach(function(key) {
            //    var row = key.split('-')[0];
            //    var col = key.split('-')[1];
            //
            //    if(row > maxRow) {
            //        maxRow = row;
            //    }
            //
            //    if(col > maxCol) {
            //        maxCol = col;
            //    }
            //    data.push({score: result[key], row: row, col: col});
            //
            //
            //});
            //
            //
            //$scope.data = data;
            ////$scope.data = [
            ////    {score: 5, row: 0, col: 0},
            ////    {score: 7, row: 0, col: 1},
            ////    //{score: 0.2, row: 1, col: 0},
            ////    {score: 4, row: 1, col: 1},
            ////    {score: 3, row: 2, col: 0},
            ////    {score: 5, row: 2, col: 1},
            ////    {score: 2, row: 3, col: 5},
            ////    {score: 7, row: 3, col: 1}
            ////];
            //
            //$scope.cols = maxCol;
            //$scope.rows = maxRow;

            //console.log(maxCol);
            //console.log(maxRow);

            $scope.heatmapVisible = true;

            //$state.go($state.$current, null, { reload: false });

        };


        //$scope.random = function (µ, σ) {
        //        var x, y, r;
        //        do {
        //            x = Math.random() * 2 - 1;
        //            y = Math.random() * 2 - 1;
        //            r = x * x + y * y;
        //        } while (!r || r > 1);
        //        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
        //};
    }
]);
