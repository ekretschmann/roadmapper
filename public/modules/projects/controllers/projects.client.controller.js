'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', 'Roadmaps',
    function ($scope, $stateParams, $location, Authentication, Projects, Roadmaps) {
        $scope.authentication = Authentication;

        $scope.roadmapName = '';
        $scope.epicName = '';


        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return true;
            },
            itemMoved: function (event) {

            },
            orderChanged: function (event) {
               // $scope.project.roadmaps = [];
                $scope.project.$update(function (response) {
                    $scope.message = 'Changed Priorities';
                }, function (errorResponse) {
                    console.log(errorResponse);
                });
            },
            containment: '#board'
        };

        $scope.addEpic = function () {

            $scope.project.epics.push($scope.epicName);
            $scope.project.$update(function (response) {
                $scope.epicName = '';
            }, function (errorResponse) {
                console.log(errorResponse);
            });
        };

        $scope.removeEpic = function (epic) {



            $scope.project.epics.splice($scope.project.epics.indexOf(epic), 1);

            $scope.project.$update(function (response) {
                $scope.message = 'Removed ' + epic;
            }, function (errorResponse) {
                console.log(errorResponse);
            });
        };

        $scope.addRoadmap = function () {
            var newRoadmap = new Roadmaps({
                name: $scope.roadmapName
            });

            newRoadmap.projectId = $scope.project._id;
            if ($scope.project) {
                newRoadmap.epics = [];
                $scope.project.epics.forEach(function(epic){


                    newRoadmap.epics.push({name: epic, estimated: 20, deviation: 5});
                });


            }
            newRoadmap.$save(function (response) {

                $scope.project.roadmaps.push(newRoadmap._id);
                $scope.project.$update(function (response) {
                    $scope.roadmapName = '';
                    //console.log(response);
                }, function (errorResponse) {
                    console.log(errorResponse);
                });
            }, function (errorResponse) {
                console.log(errorResponse);
            });



        };


        // Create new Project
        $scope.create = function () {
            // Create new Project object
            var project = new Projects({
                name: this.name
            });

            // Redirect after save
            project.$save(function (response) {

                // Clear form fields
                $scope.projects.push(response);
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Project
        $scope.remove = function (project) {
            if (project) {
                project.$remove();

                for (var i in $scope.projects) {
                    if ($scope.projects [i] === project) {
                        $scope.projects.splice(i, 1);
                    }
                }
            } else {
                $scope.project.$remove(function () {
                    $location.path('/');
                });
            }
        };

        // Update existing Project
        $scope.update = function () {
            var project = $scope.project;

            project.$update(function () {
                $location.path('projects/' + project._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Projects
        $scope.find = function () {
            $scope.projects = Projects.query({
                user: $scope.authentication.user._id
            });
        };

        // Find existing Project
        $scope.findOne = function () {
            $scope.project = Projects.get({
                projectId: $stateParams.projectId
            });
        };


    }
]);
