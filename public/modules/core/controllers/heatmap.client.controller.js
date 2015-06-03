'use strict';

/* global d3 */
/* global moment */
angular.module('core').service('HeatmapService', [
    function () {


        //this.col_number = 2;
        //this.row_number = 3;
        //cellWidth = 6;
        //
        //this.labelWidth = 100;


        //this.$watch(function () {
        //    return SimulationService.toggle;
        //}, function (newValue, oldValue) {
        //
        //    this.init(SimulationService.d3Data);
        //});


        this.drawHeatmap = function (d3data, labelWidth, cellWidth, showExpected, showInterval) {



            var data = d3data.data;
            var cols = d3data.cols;
            var rows = d3data.rows;
            //cellWidth = Math.floor(720 / d3data.cols);
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


            this.col_number = cols;
            this.row_number = rows;

            var gridSize = cellWidth,
                h = 25,
                w = cellWidth,
                rectPadding = 60;

            var colorLow = '#FFFFFF', colorMed = '#339933', colorHigh = '#009900';

            var margin = {top: 20, right: 80, bottom: 30, left: 50},
                width = 2 * cols * cellWidth,
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
                    return d.col * w + labelWidth;
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
                    if (showInterval && (d.expectedDeliveryDateEarly || d.expectedDeliveryDateLate)) {
                        return '#FAF61B';
                    }
                    if (showExpected && d.expectedDeliveryDate) {
                        return '#3333FF';
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
                .attr('x', 0 + labelWidth)
                .attr('y', function (d, i) {
                    return i * 25 + 15;
                })
                .style('text-anchor', 'end')
                .attr('transform', 'translate(-6,' + cellWidth / 1.5 + ')')
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
                    this.sortbylabel('r', i, rowSortOrder);
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
                    return (i * cellWidth) + labelWidth;
                })
                .attr('y', -5)
                .style('text-anchor', 'left')
                //.attr('transform', 'translate('+cellWidth/2 + ',-6) rotate (-90)')
                .attr('class', function (d, i) {
                    return 'colLabel mono c' + i;
                })
                //.on('mouseover', function(d) {d3.select(this).classed('text-hover',true);})
                //.on('mouseout' , function(d) {d3.select(this).classed('text-hover',false);})
                //.on('click', function(d,i) {colSortOrder=!colSortOrder;  this.sortbylabel('c',i,colSortOrder);d3.select('#order').property('selectedIndex', 4).node().focus();;})
            ;

            var x = labelWidth;

            while (x < colLabels.length*cellWidth) {

                x += 14*cellWidth;
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



    }
]);
