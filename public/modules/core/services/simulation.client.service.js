'use strict';

/* global moment */
angular.module('core').service('SimulationService', [
    function () {

        this.toggle = false;
        this.d3Data = {};

        this.run = function (roadmap) {



            this.d3Data = this.transformToD3Format(this.runSimulation(roadmap.epics));
            this.d3Data.start = roadmap.start;


            var rows = [];
            //var keys = Object.keys(this.d3Data.data);
            for (var i = 0; i <= this.d3Data.rows; i++) {
                rows[i] = [];
                var total = 0;


                for (var j = 0; j < this.d3Data.data.length; j++) {

                    var item = this.d3Data.data[j];
                    if (parseInt(item.row) === i) {
                        rows[i].push({score: item.score, col: item.col});
                        total += item.score;
                    }
                }


                rows[i].sort(function (a, b) {
                    return a.col - b.col;
                });

                // console.log(total);

                //console.log(rows[i]);
                var current = 0;
                for (j = 0; j < rows[i].length; j++) {
                    var point = rows[i][j];
                    //console.log(point);
                    current += point.score;
                    point.probability = current / total;
                    //console.log(this.d3Data.data[i+'-'+j].score);
                }
            }

            for (var k = 0; k < this.d3Data.data.length; k++) {

                var dataPoint = this.d3Data.data[k];
                    for (var l = 0; l < rows[dataPoint.row].length; l++) {

                        if (rows[dataPoint.row][l].col === dataPoint.col) {
                            dataPoint.probability = Math.round(rows[dataPoint.row][l].probability * 100) + '%';
                        }
                    }

            }


            this.populateColLabels(this.d3Data, roadmap.start);
            this.populateRowLabels(roadmap.epics);
            this.toggle = !this.toggle;


        };

        this.populateRowLabels = function (epics) {
            var rowLabels = [];
            epics.forEach(function (epic) {
                rowLabels.push(epic.name);
            }, this);

            this.d3Data.rowLabels = rowLabels;
        };

        this.populateColLabels = function (d3Data, startDate) {
            var colLabels = [];
            var date = moment(startDate);
            for (var d = 0; d < d3Data.cols; d++) {
                date.add(1, 'days');
                if (d % 14 === 0) {
                    colLabels.push(date.format('D/MM'));
                } else {
                    colLabels.push('');
                }
            }
            this.d3Data.colLabels = colLabels;
        };

        this.transformToD3Format = function (rawData) {
            var data = [];
            var maxRow = 0;
            var maxCol = 0;

            Object.keys(rawData).forEach(function (key) {
                var row = key.split('-')[0];
                var col = key.split('-')[1];


                if (parseInt(row) > maxRow) {
                    maxRow = row;
                }

                if (parseInt(col) > maxCol) {
                    maxCol = col;
                }
                data.push({score: rawData[key], row: row, col: col});
            });
            return {rows: maxRow, cols: maxCol, data: data};
        };


        this.runSimulation = function (epics) {

            var overlap = 0.3;
            var result = [];
            for (var x = 0; x < 10000; x++) {
                var map = [];


                for (var j = 0; j < epics.length; j++) {
                    var epic = epics[j];
                    map.push({
                        active: false,
                        val: Math.max(1, this.random(epic.estimated, epic.deviation))
                    });

                }

                var total = 0;
                var originals = [];
                for (j = 0; j < map.length; j++) {
                    total += map[j].val;
                    originals.push(map[j].val);
                }


                map[0].active = true;


                var deliveries = [];


                for (var i = 0; i <= total; i++) {


                    var activeEpics = 0;
                    for (j = 0; j < map.length; j++) {
                        if (map[j].active) {
                            activeEpics++;
                        }
                    }


                    for (var k = 0; k < map.length; k++) {
                        var item = map[k];
                        if (item.active) {
                            item.val -= (1.0 / activeEpics);
                            if (item.val < 0) {
                                item.active = false;
                                deliveries[k] = i;
                            }
                            if (item.val < overlap * originals[k]) {
                                if (map.length > k + 1) {
                                    if (map[k + 1].val > 0) {
                                        map[k + 1].active = true;
                                    }
                                }
                            }
                        }
                    }


                }
                for (i = 0; i < deliveries.length; i++) {
                    var index = i + '-' + deliveries[i];
                    if (result[index]) {
                        result[index] += 1;
                    } else {
                        result[index] = 1;
                    }
                }
            }

            return result;
        };


        this.random = function (µ, σ) {
            var x, y, r;
            do {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                r = x * x + y * y;
            } while (!r || r > 1);
            return µ + (σ / 3.0) * x * Math.sqrt(-2 * Math.log(r) / r);
        };
    }
]);
