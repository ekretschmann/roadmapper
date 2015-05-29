'use strict';

/* global moment */
angular.module('core').service('SimulationService', [
	function() {

		this.toggle = false;
		this.data = [];
		this.rows = 0;
		this.cols = 0;
		this.rowLabels = [];
		this.colLabels = [];
		this.start = Date.now();

		this.run = function (roadmap) {


			this.start = roadmap.start;

			var epics = roadmap.epics;
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

					//console.log(map[j].val);
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




			var data = [];
			var maxRow = 0;
			var maxCol = 0;

			Object.keys(result).forEach(function(key) {
				var row = key.split('-')[0];
				var col = key.split('-')[1];

				console.log(col);

				if(row > maxRow) {
					maxRow = row;
				}

				if(parseInt(col) > maxCol) {
					maxCol = col;
				}
				data.push({score: result[key], row: row, col: col});
			});





			this.colLabels = [];
			var date = moment(roadmap.start);
			for (var d = 0; d < maxCol; d++) {

				date.add(1, 'days');
				if (d%14 === 0) {



					this.colLabels.push(date.format('D/MM'));


				} else {
					this.colLabels.push('');
				}
			}


			this.data = data;


			this.cols = maxCol;
			this.rows = maxRow;


			this.rowLabels = [];
			epics.forEach(function(epic) {
				this.rowLabels.push(epic.name);
			}, this);

			this.toggle = !this.toggle;


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
