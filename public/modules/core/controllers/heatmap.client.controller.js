'use strict';

/* global d3 */
angular.module('core').controller('HeatmapController', ['$scope', 'Authentication', 'SimulationService',
    function ($scope, Authentication, SimulationService) {
        // This provides Authentication context.
        $scope.authentication = Authentication;


        $scope.col_number = 2;
        $scope.row_number = 3;
        $scope.cellSize = 3;
        $scope.svg = undefined;
        $scope.first = true;


        $scope.$watch(function() { return SimulationService.toggle; }, function(newValue, oldValue) {
            $scope.init(SimulationService.data, SimulationService.cols, SimulationService.rows);
        });



        $scope.init = function (data, cols, rows) {



            $scope.col_number = cols;
            $scope.row_number = rows;

            var gridSize = $scope.cellSize,
                h = 25,
                w = $scope.cellSize,
                rectPadding = 60;

            var colorLow = 'white', colorMed = '#999999', colorHigh = 'black';

            var margin = {top: 20, right: 80, bottom: 30, left: 50},
                width = 2*cols*$scope.cellSize,
                height = rows*25;

            var colorScale = d3.scale.linear()
                .domain([0, 15, 30])
                .range([colorLow, colorMed, colorHigh]);



            //d3.select('#heatmap').remove('svg');


            if ($scope.first) {
                $scope.svg = d3.select('#heatmap').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                ;
                $scope.first = false;
            }

            var heatMap = $scope.svg.selectAll('.heatmap')
                .data(data, function (d) {
                    return d.row + ':' + d.col;
                })
                .enter().append('svg:rect')
                .attr('x', function (d) {
                    return d.col * w;
                })
                .attr('y', function (d) {
                    return d.row * h;
                })
                .attr('width', function (d) {
                    return w;
                })
                .attr('height', function (d) {
                    return h;
                })
                .style('fill', function (d) {
                    return colorScale(d.score);
                });


            

            //var rowLabel = ['a', 'b', 'c'],
            //    colLabel = ['1/12', '15/12'],
            //    rowSortOrder = false,
            //    colSortOrder = false;


            //var rowLabels = $scope.svg.append('g')
            //        .selectAll('.rowLabelg')
            //        .data(rowLabel)
            //        .enter()
            //        .append('text')
            //        .text(function (d) {
            //            return d;
            //        })
            //        .attr('x', 0)
            //        .attr('y', function (d, i) {
            //            return i * $scope.cellSize;
            //        })
            //        .style('text-anchor', 'end')
            //        .attr('transform', 'translate(-6,' + $scope.cellSize / 1.5 + ')')
            //        .attr('class', function (d, i) {
            //            return 'rowLabel mono r' + i;
            //        })
            //        .on('mouseover', function (d) {
            //            d3.select(this).classed('text-hover', true);
            //        })
            //        .on('mouseout', function (d) {
            //            d3.select(this).classed('text-hover', false);
            //        })
            //        .on('click', function (d, i) {
            //            rowSortOrder = !rowSortOrder;
            //            $scope.sortbylabel('r', i, rowSortOrder);
            //            d3.select('#order').property('selectedIndex', 4).node().focus();
            //        })
            //    ;


            //var colLabels = $scope.svg.append('g')
            //        .selectAll('.colLabelg')
            //        .data(colLabel)
            //        .enter()
            //        .append('text')
            //        .text(function (d) { return d; })
            //        .attr('x', function (d, i) { return i * $scope.cellSize +3; })
            //        .attr('y', -5)
            //        .style('text-anchor', 'left')
            //        //.attr('transform', 'translate('+$scope.cellSize/2 + ',-6) rotate (-90)')
            //        .attr('class',  function (d,i) { return 'colLabel mono c'+i;} )
            //        //.on('mouseover', function(d) {d3.select(this).classed('text-hover',true);})
            //        //.on('mouseout' , function(d) {d3.select(this).classed('text-hover',false);})
            //        //.on('click', function(d,i) {colSortOrder=!colSortOrder;  $scope.sortbylabel('c',i,colSortOrder);d3.select('#order').property('selectedIndex', 4).node().focus();;})
            //    ;


        };


        $scope.sortbylabel = function (rORc, i, sortOrder) {
            var t = $scope.svg.transition().duration(3000);
            var log2r = [];
            var sorted; // sorted is zero-based index
            d3.selectAll('.c' + rORc + i)
                .filter(function (ce) {
                    log2r.push(ce.value);
                })
            ;
            if (rORc === 'r') { // sort log2ratio of a gene
                sorted = d3.range($scope.col_number).sort(function (a, b) {
                    if (sortOrder) {
                        return log2r[b] - log2r[a];
                    } else {
                        return log2r[a] - log2r[b];
                    }
                });
                t.selectAll('.cell')
                    .attr('x', function (d) {
                        return sorted.indexOf(d.col - 1) * $scope.cellSize;
                    })
                ;
                t.selectAll('.colLabel')
                    .attr('y', function (d, i) {
                        return sorted.indexOf(i) * $scope.cellSize;
                    })
                ;
            } else { // sort log2ratio of a contrast
                sorted = d3.range($scope.row_number).sort(function (a, b) {
                    if (sortOrder) {
                        return log2r[b] - log2r[a];
                    } else {
                        return log2r[a] - log2r[b];
                    }
                });
                t.selectAll('.cell')
                    .attr('y', function (d) {
                        return sorted.indexOf(d.row - 1) * $scope.cellSize;
                    })
                ;
                t.selectAll('.rowLabel')
                    .attr('y', function (d, i) {
                        return sorted.indexOf(i) * $scope.cellSize;
                    })
                ;
            }
        };




    }
]);