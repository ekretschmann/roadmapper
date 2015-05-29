'use strict';

/* global moment */
angular.module('core').service('SimulationService', [
	function() {

		this.toggle = false;
		//this.data = [];
		//this.rows = 0;
		//this.cols = 0;
		//this.rowLabels = [];
		//this.colLabels = [];
		//this.start = Date.now();

		this.d3Data = {};

		this.run = function (roadmap) {



			this.d3Data = this.transformToD3Format(this.runSimulation(roadmap.epics));
			this.d3Data.start = roadmap.start;



			//var rows = [];
			//for (i=0;i<maxRow;i++) {
			//	rows[i] = [];
			//	var total = 0;
			//	data.forEach(function(item) {
			//		if (parseInt(item.row) === i) {
			//			rows[i].push({score: item.score, col:item.col});
			//			total += item.score;
			//		}
			//	});
			//
			//	rows[i].sort(function(a, b) {
			//		return a.col - b.col;
			//	});
			//
			//	console.log(total);
			//	//console.log(rows[i]);
			//}




			this.populateColLabels(this.d3Data, roadmap.start);
			this.populateRowLabels(roadmap.epics);
			this.toggle = !this.toggle;


		};

		this.populateRowLabels = function(epics) {
			var rowLabels = [];
			epics.forEach(function(epic) {
				rowLabels.push(epic.name);
			}, this);

			this.d3Data.rowLabels = rowLabels;
		};

		this.populateColLabels = function(d3Data, startDate) {
			var colLabels = [];
			var date = moment(startDate);
			for (var d = 0; d < d3Data.cols; d++) {
				date.add(1, 'days');
				if (d%14 === 0) {
					colLabels.push(date.format('D/MM'));
				} else {
					colLabels.push('');
				}
			}
			this.d3Data.colLabels = colLabels;
		};

		this.transformToD3Format = function(rawData) {
			var data = [];
			var maxRow = 0;
			var maxCol = 0;

			Object.keys(rawData).forEach(function(key) {
				var row = key.split('-')[0];
				var col = key.split('-')[1];


				if(row > maxRow) {
					maxRow = row;
				}

				if(parseInt(col) > maxCol) {
					maxCol = col;
				}
				data.push({score: rawData[key], row: row, col: col});
			});
			return {rows: maxRow, cols: maxCol, data:data};
		};


		this.runSimulation = function(epics) {

			var overlap = 0.5;
			var result = [];
			for(var x=0; x<1000;x++) {
				var map = [];


				for(var j=0; j<epics.length;j++) {
					var epic= epics[j];
					map.push({
						active: false,
						val: Math.max(1, this.random(epic.estimated, epic.deviation))
					});

				}

				var total = 0;
				var originals = [];
				for(j=0; j<map.length;j++) {
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

				//console.log(total+deliveries);

				for (i = 0; i<deliveries.length; i++) {
					var index = i+'-'+deliveries[i];
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
			return µ + (σ/3.0) * x * Math.sqrt(-2 * Math.log(r) / r);
		};
	}
]);
