'use strict';

//Menu service used for managing  menus
angular.module('core').service('SimulationService', [
	function() {

		this.toggle = false;
		this.data = [];
		this.rows = 0;
		this.cols = 0;

		this.run = function (epics) {

			var result = [];
			for(var x=0; x<1000;x++) {
				var map = [];

				for(var j=0; j<epics.length;j++) {
					var epic= epics[j];
					map.push({
						active: false,
						val: Math.max(1, Math.round(this.random(epic.estimated, epic.deviation)))
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
							if (item.val < 0.5 * originals[k]) {
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

				if(row > maxRow) {
					maxRow = row;
				}

				if(col > maxCol) {
					maxCol = col;
				}
				data.push({score: result[key], row: row, col: col});


			});

			//console.log(data);


			this.data = data;

			//$scope.data = [
			//    {score: 5, row: 0, col: 0},
			//    {score: 7, row: 0, col: 1},
			//    //{score: 0.2, row: 1, col: 0},
			//    {score: 4, row: 1, col: 1},
			//    {score: 3, row: 2, col: 0},
			//    {score: 5, row: 2, col: 1},
			//    {score: 2, row: 3, col: 5},
			//    {score: 7, row: 3, col: 1}
			//];

			this.cols = maxCol;
			this.rows = maxRow;

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
