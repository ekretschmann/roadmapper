'use strict';

/* global d3 */
angular.module('core').controller('HeatmapController', ['$scope', 'Authentication',
    function ($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;


        $scope.col_number = 2;
        $scope.row_number = 3;
        $scope.cellSize = 60;
        $scope.svg = undefined;


        $scope.init = function () {


            var data = [
                {score: 0.5, row: 0, col: 0},
                {score: 0.7, row: 0, col: 1},
                {score: 0.2, row: 1, col: 0},
                {score: 0.4, row: 1, col: 1},
                {score: 0.3, row: 2, col: 0},
                {score: 0.5, row: 2, col: 1}
            ];

            var gridSize = $scope.cellSize,
                h = $scope.cellSize,
                w = $scope.cellSize,
                rectPadding = 60;

            var colorLow = 'green', colorMed = 'yellow', colorHigh = 'red';

            var margin = {top: 20, right: 80, bottom: 30, left: 50},
                width = 640 - margin.left - margin.right,
                height = 380 - margin.top - margin.bottom;

            var colorScale = d3.scale.linear()
                .domain([-1, 0, 1])
                .range([colorLow, colorMed, colorHigh]);

          


            $scope.svg = d3.select('#heatmap').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                ;

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


            

            var rowLabel = ['a', 'b', 'c'],
                colLabel = ['con1027', 'con1028'],
                rowSortOrder = false;


            var rowLabels = $scope.svg.append('g')
                    .selectAll('.rowLabelg')
                    .data(rowLabel)
                    .enter()
                    .append('text')
                    .text(function (d) {
                        return d;
                    })
                    .attr('x', 0)
                    .attr('y', function (d, i) {
                        return i * $scope.cellSize;
                    })
                    .style('text-anchor', 'end')
                    .attr('transform', 'translate(-6,' + $scope.cellSize / 1.5 + ')')
                    .attr('class', function (d, i) {
                        return 'rowLabel mono r' + i;
                    })
                    .on('mouseover', function (d) {
                        d3.select(this).classed('text-hover', true);
                    })
                    .on('mouseout', function (d) {
                        d3.select(this).classed('text-hover', false);
                    })
                    .on('click', function (d, i) {
                        rowSortOrder = !rowSortOrder;
                        $scope.sortbylabel('r', i, rowSortOrder);
                        d3.select('#order').property('selectedIndex', 4).node().focus();
                    })
                ;


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
