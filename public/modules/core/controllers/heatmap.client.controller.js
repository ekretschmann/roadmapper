'use strict';

/* global d3 */
/* global moment */
angular.module('core').controller('HeatmapController', ['$scope', 'Authentication', 'SimulationService',
    function ($scope, Authentication, SimulationService) {
        // This provides Authentication context.
        $scope.authentication = Authentication;


        $scope.col_number = 2;
        $scope.row_number = 3;
        $scope.cellSize = 6;

        $scope.labelWidth = 100;


        $scope.$watch(function () {
            return SimulationService.toggle;
        }, function (newValue, oldValue) {

            $scope.init(SimulationService.d3Data);
        });


        $scope.init = function (d3data) {


            var data = d3data.data;
            var cols = d3data.cols;
            var rows = d3data.rows;
            //$scope.cellSize = Math.floor(720 / d3data.cols);
            var rowLabels = d3data.rowLabels;
            var colLabels = d3data.colLabels;
            var start = d3data.start;


            var max = data[0].score;

            //console.log(start);
            var s = moment(start);
            data.forEach(function (point) {
                var sdate = moment(s);
                if (max < point.score) {
                    max = point.score;
                }

                sdate.add(point.col, 'days');
                point.date = sdate.format('D/MM');

            }, this);


            $scope.col_number = cols;
            $scope.row_number = rows;

            var gridSize = $scope.cellSize,
                h = 25,
                w = $scope.cellSize,
                rectPadding = 60;

            var colorLow = '#FFFFFF', colorMed = '#339933', colorHigh = '#009900';

            var margin = {top: 20, right: 80, bottom: 30, left: 50},
                width = 2 * cols * $scope.cellSize,
                height = rows * 25;

            var colorScale = d3.scale.linear()
                .domain([0, max / 1.5, max])
                .range([colorLow, colorMed, colorHigh]);


            var svg = d3.select('#heatmap');

            svg.selectAll('*').remove();
            svg = d3.select('#heatmap').append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            ;


            svg.selectAll('.heatmap')
                .data(data, function (d) {
                    return d.row + ':' + d.col;
                })
                .enter().append('svg:rect')
                .attr('x', function (d) {
                    return d.col * w + $scope.labelWidth;
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
                    //console.log(d);
                    if (d.expectedDeliveryDate) {
                        return '#990000';
                    }
                    return colorScale(d.score);
                }).on('mouseover', function (d) {
                    //highlight text
                    d3.select(this).classed('cell-hover', true);
                    //d3.selectAll('.rowLabel').classed('text-highlight',function(r,ri){  return ri==(d.row);});
                    //d3.selectAll('.colLabel').classed('text-highlight',function(c,ci){  console.log(ci==(d.col));return ci==(d.col);});

                    //Update the tooltip position and value
                    d3.select('#tooltip')
                        .style('left', (d3.event.pageX + 10) + 'px')
                        .style('top', (d3.event.pageY - 10) + 'px')
                        .select('#value')
                        .text(d.date + '\n' + d.probability);
                    //Show the tooltip
                    d3.select('#tooltip').classed('hidden', false);
                })
                .on('mouseout', function () {
                    d3.select(this).classed('cell-hover', false);
                    //d3.selectAll('.rowLabel').classed('text-highlight',false);
                    //d3.selectAll('.colLabel').classed('text-highlight',false);
                    d3.select('#tooltip').classed('hidden', true);
                });
            var rowSortOrder = false;


            svg.append('g')
                .selectAll('.rowLabelg')
                .data(rowLabels)
                .enter()
                .append('text')
                .text(function (d) {
                    return d;
                })
                .attr('x', 0 + $scope.labelWidth)
                .attr('y', function (d, i) {
                    return i * 25 + 15;
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


            svg.append('g')
                .selectAll('.colLabelg')
                .data(colLabels)
                .enter()
                .append('text')
                .text(function (d) {
                    return d;
                })
                .attr('x', function (d, i) {
                    return (i * $scope.cellSize) + $scope.labelWidth;
                })
                .attr('y', -5)
                .style('text-anchor', 'left')
                //.attr('transform', 'translate('+$scope.cellSize/2 + ',-6) rotate (-90)')
                .attr('class', function (d, i) {
                    return 'colLabel mono c' + i;
                })
                //.on('mouseover', function(d) {d3.select(this).classed('text-hover',true);})
                //.on('mouseout' , function(d) {d3.select(this).classed('text-hover',false);})
                //.on('click', function(d,i) {colSortOrder=!colSortOrder;  $scope.sortbylabel('c',i,colSortOrder);d3.select('#order').property('selectedIndex', 4).node().focus();;})
            ;

            var x = $scope.labelWidth;

            while (x < colLabels.length*$scope.cellSize) {
                x += 14*$scope.cellSize;
                svg.append('line')
                    .attr('x1', x)
                    .attr('y1', 0)
                    .attr('x2', x)
                    .attr('y2', height + 40)
                    .attr('stroke-width', 1)
                    .style('stroke-dasharray', ('3, 3'))
                    .attr('stroke', '#AAAAAA');
            }

        };


        //$scope.sortbylabel = function (rORc, i, sortOrder) {
        //    var t = $scope.svg.transition().duration(3000);
        //    var log2r = [];
        //    var sorted; // sorted is zero-based index
        //    d3.selectAll('.c' + rORc + i)
        //        .filter(function (ce) {
        //            log2r.push(ce.value);
        //        })
        //    ;
        //    if (rORc === 'r') { // sort log2ratio of a gene
        //        sorted = d3.range($scope.col_number).sort(function (a, b) {
        //            if (sortOrder) {
        //                return log2r[b] - log2r[a];
        //            } else {
        //                return log2r[a] - log2r[b];
        //            }
        //        });
        //        t.selectAll('.cell')
        //            .attr('x', function (d) {
        //                return sorted.indexOf(d.col - 1) * $scope.cellSize;
        //            })
        //        ;
        //        t.selectAll('.colLabel')
        //            .attr('y', function (d, i) {
        //                return sorted.indexOf(i) * $scope.cellSize;
        //            })
        //        ;
        //    } else { // sort log2ratio of a contrast
        //        sorted = d3.range($scope.row_number).sort(function (a, b) {
        //            if (sortOrder) {
        //                return log2r[b] - log2r[a];
        //            } else {
        //                return log2r[a] - log2r[b];
        //            }
        //        });
        //        t.selectAll('.cell')
        //            .attr('y', function (d) {
        //                return sorted.indexOf(d.row - 1) * $scope.cellSize;
        //            })
        //        ;
        //        t.selectAll('.rowLabel')
        //            .attr('y', function (d, i) {
        //                return sorted.indexOf(i) * $scope.cellSize;
        //            })
        //        ;
        //    }
        //};


    }
]);
