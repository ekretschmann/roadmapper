'use strict';

/* global moment, jstat */
angular.module('core').service('SimulationService', [
    function () {

        this.toggle = false;
        this.d3Data = {};

        this.run = function (roadmap, n) {


            roadmap.$update();

            this.d3Data = this.transformToD3Format(this.runSimulation(roadmap.epics, roadmap.estimationModel, n));
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

                var current = 0;
                var firstTimeEarly = true;
                var firstTimeLate = true;
                var firstTimeExpected = true;
                for (j = 0; j < rows[i].length; j++) {
                    var point = rows[i][j];
                    current += point.score;
                    point.probability = current / total;
                    if (point.probability > 0.05 && firstTimeEarly) {

                        point.expectedDeliveryDateEarly = true;
                        firstTimeEarly = false;
                    } else {
                        point.expectedDeliveryDateEarly = false;

                    }

                    if (point.probability > 0.95 && firstTimeLate) {

                        point.expectedDeliveryDateLate = true;
                        firstTimeLate = false;
                    } else {
                        point.expectedDeliveryDateLate = false;

                    }

                    if (point.probability > 0.5 && firstTimeExpected) {

                        point.expectedDeliveryDate = true;
                        firstTimeExpected = false;
                    } else {
                        point.expectedDeliveryDate = false;

                    }
                }
            }

            for (var k = 0; k < this.d3Data.data.length; k++) {

                var dataPoint = this.d3Data.data[k];
                for (var l = 0; l < rows[dataPoint.row].length; l++) {

                    if (rows[dataPoint.row][l].col === dataPoint.col) {
                        dataPoint.probability = Math.round(rows[dataPoint.row][l].probability * 100) + '%';
                        dataPoint.expectedDeliveryDateEarly = rows[dataPoint.row][l].expectedDeliveryDateEarly;
                        dataPoint.expectedDeliveryDateLate = rows[dataPoint.row][l].expectedDeliveryDateLate;
                        dataPoint.expectedDeliveryDate = rows[dataPoint.row][l].expectedDeliveryDate;
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


        this.runSimulation = function (epics, model, n) {


            var overlap = 0.3;
            var result = [];
            for (var x = 0; x < n; x++) {
                var map = [];


                for (var j = 0; j < epics.length; j++) {
                    var epic = epics[j];
                    var val = 0;
                    if (model === 'normal') {
                        val = Math.max(1, this.random(parseFloat(epic.estimated), parseFloat(epic.deviation)));
                    } else {
                        val = this.pertRandom(epic.low, epic.expected, epic.high);
                    }

                    map.push({
                        active: false,
                        val: val
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


        this.pertRandom = function (min, mode, max) {

            //if( min > max || mode > x.max || x.mode < x.min ) stop( "invalid parameters" );

            var range = max - min;
            if (range === 0) {
                return mode;
            }

            var µ = (min + max + 4 * mode ) / 6;

            //# special case if mu == mode
            var v;
            if (µ === mode) {
                v = 2;
            }
            else {
                v = (( µ - min ) * ( 2 * mode - min - max )) /
                (( mode - µ ) * ( max - min ));
            }

            var w = ( v * ( max - µ )) / ( µ - min );
            //return ( rbeta( n, v, w ) * x.range + x.min );
            return ( jStat.beta.sample(v, w) * range + min );


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
