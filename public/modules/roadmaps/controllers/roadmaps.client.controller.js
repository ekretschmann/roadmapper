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
            });
        };

        // Find existing Roadmap
        $scope.findById = function (id) {
            $scope.roadmap = Roadmaps.get({
                roadmapId: id
            });
        };

        $scope.run = function () {
            console.log('running');

            var map = [];

            $scope.roadmap.epics.forEach(function(epic) {
                map.push({active: false, val:Math.max(0, Math.round($scope.random(epic.estimated, epic.deviation)))});
            }, this);


            var total = 0;
            map.forEach(function(x) {
                total += x.val;

            }, this);


            map[0].active = true;

            var originals = [];
            map.forEach(function(item) {
                originals.push(item.val);
            });

            var deliveries = [];


            for(var i=0; i<total; i++) {


                var activeEpics = 0;
                for(var j=0; j<map.length; j++) {
                    if(map[j].active) {
                        activeEpics++;
                    }
                }


                for(var k=0; k<map.length; k++) {
                    var item = map[k];
                    if(item.active) {
                        item.val -= (1.0 / activeEpics);
                        if (item.val < 0) {
                            item.active = false;
                            deliveries[k] = i;
                        }
                        if (item.val < 0.5*originals[k]) {
                            if (map.length>k+1) {
                                if(map[k + 1].val > 0) {
                                    map[k + 1].active = true;
                                }
                            }
                        }
                    }
                }



            }

            console.log(total);
            console.log(originals);
            console.log(deliveries);




        };


        $scope.random = function (µ, σ) {
                var x, y, r;
                do {
                    x = Math.random() * 2 - 1;
                    y = Math.random() * 2 - 1;
                    r = x * x + y * y;
                } while (!r || r > 1);
                return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
        };
    }
]);
