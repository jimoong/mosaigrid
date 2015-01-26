if (!Array.prototype.every) {
	Array.prototype.every = function(callbackfn, thisArg) {
		'use strict';
		var T, k;

		if (this == null) {
			throw new TypeError('this is null or not defined');
		}

		// 1. Let O be the result of calling ToObject passing the this 
		//		value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method
		//		of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
		if (typeof callbackfn !== 'function') {
			throw new TypeError();
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let k be 0.
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//	 This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal 
			//		method of O with argument Pk.
			//	 This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal method
				//		of O with argument Pk.
				kValue = O[k];

				// ii. Let testResult be the result of calling the Call internal method
				//		 of callbackfn with T as the this value and argument list 
				//		 containing kValue, k, and O.
				var testResult = callbackfn.call(T, kValue, k, O);

				// iii. If ToBoolean(testResult) is false, return false.
				if (!testResult) {
					return false;
				}
			}
			k++;
		}
		return true;
	};
}

var BreakException= {};
var isEmpty = function (element, index, array) {
	return element === 0;
};

var Grid = function(options) {
	this.container = document.querySelector(options.element);
	this.columns = options.columns;
	this.margin = options.margin;
	this.unit = 0;
	this.items = [];
	this.grid = [];

	var that = this;

	var Dragger = function() {

	};

	var Item = function (image, index) {
		this.x = this.y = 0;
		this.index = index;
		this.spanX = 1;
		this.spanY = 1;
		this.orientation = image.width / image.height;

		var item = this;

		this.element = document.createElement('div');
		this.element.className = 'grid-item';

		var buttons = document.createElement('div');
		buttons.className = 'grid-item-controls';

		var increase = document.createElement('button');
		increase.className = 'grid-item-increase';
		increase.innerHTML = '&#43;';
		increase.addEventListener('click', function() {
			item.increase();
		}, false);
		buttons.appendChild(increase);

		var decrease = document.createElement('button');
		decrease.className = 'grid-item-decrease';
		decrease.innerHTML = '&#45;';
		decrease.addEventListener('click', function() {
			item.decrease();
		}, false);
		buttons.appendChild(decrease);

		this.element.appendChild(buttons);
	};
	Item.prototype.increase = function() {
		if (this.spanX >= that.columns) {
			return;
		}

		if (this.spanX / this.spanY < this.orientation) {
			this.spanX++;
		}
		else {
			this.spanY++;
		}

		that.draw(this);
	};
	Item.prototype.decrease = function() {
		if (this.spanX <= 1 && this.spanY <= 1) {
			return;
		}
		
		if (this.spanX / this.spanY < this.orientation) {
			this.spanY--;
		}
		else {
			this.spanX--;
		}

		that.draw(this);
	};

	function _itemize(image, index) {
		item = new Item(image, index);
		that.items.push(item);
		that.container.replaceChild(item.element, image);

		var css = 'position:absolute;background-image:url('+image.src+');top:0;left:0;width:0;height:0;';
		item.element.style.cssText = css;
	}

	function _init() {
		that.unit = (that.container.offsetWidth - that.margin * (that.columns + 1)) / that.columns;
		[].slice.call(that.container.querySelectorAll('img')).forEach(_itemize);
	}

	window.addEventListener('load', _init, false);
};
Grid.prototype.update = function() {
	var count = 0;
	this.items.forEach(function(item) {
		count += item.spanX * item.spanY;
	});

	for (var y = 0; y < Math.ceil(count / this.columns); y++) {
		for (var x = 0; x < this.columns; x++) {
			if (!this.grid[y]) {
				var newRow = new Array(this.columns);
				for (var k = 0; k < this.columns; k++) {
					newRow[k] = 0;
				}
				this.grid.push(newRow);
			}
			else {
				this.grid[y][x] = 0;
			}
		}
	}
};
Grid.prototype.find = function(item) {
	var that = this,
		x = 0,
		y = 0;

	try {
		this.grid.forEach(function(row, i) {
			row.forEach(function(column, j) {
				var found = false;

				if (item.spanX == 1) {
					found = (column == 0);
				}
				else {
					check = row.slice(j, j + item.spanX);
					found = (check.length == item.spanX && check.every(isEmpty));
				}

				if (found) {
					x = j;
					y = i;
					throw BreakException;
				}
			});
		});
	}
	catch(e) {
		if (e !== BreakException) throw e;
	}

	return {x: x, y: y};
};
Grid.prototype.drawItem = function(item, position) {
	item.element.style.top = (this.margin + position.y * (this.unit + this.margin)) + 'px';
	item.element.style.left = (this.margin + position.x * (this.unit + this.margin)) + 'px';
	item.element.style.width = (item.spanX * (this.unit + this.margin) - this.margin) + 'px';
	item.element.style.height = (item.spanY * (this.unit + this.margin) - this.margin) + 'px';
	item.x = position.x;
	item.y = position.y;

	for (var i = position.y; i < position.y + item.spanY; i++) {
		for (var j = position.x; j < position.x + item.spanX; j++) {
			this.grid[i][j] = item;
		}
	}
};
Grid.prototype.draw = function(target) {
	var that = this;

	this.update();

	if (target && target.x + target.spanX >= this.columns) {
		var targetPosition = {
			'x': this.columns - target.spanX,
			'y': target.y
		}
		this.drawItem(target, targetPosition);
	}
	else {
		target = null;
	}

	try {
		this.items.forEach(function(item, index) {
			if (item != target) {
				that.drawItem(item, that.find(item));
			}
		});
	}
	catch(e) {
		if (e !== BreakException) throw e;
	}
};
