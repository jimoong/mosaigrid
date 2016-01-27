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
	this.margin = options.margin ? options.margin : 0;
	this.unit = 0;
	this.unith = 0; //for the case of relative height
	this.items = [];
	this.grid = [];
	this.itemTag = options.itemTag ? options.itemTag : 'img'; //if not image, get another tag
	this.showButtons = options.showButtons != true && options.showButtons != undefined ? options.showButtons : true; //show/hide buttons
	this.startOnWindowLoad = options.startOnWindowLoad ? options.startOnWindowLoad : false; //start on window onload event or not
	this.relativeHeight = options.relativeHeight ? options.relativeHeight : false; //set items height relative to the container height

	var that = this;

	var Dragger = function() {

	};

	var Item = function (el, index) {
		this.x = this.y = 0;
		this.index = index;
		this.spanX = 1;
		this.spanY = 1;
		this.orientation = (el.width ? el.width : el.clientWidth) / (el.height? el.height: el.clientHeight);

		var item = this;

		this.element = document.createElement('div');
		this.element.className = 'grid-item';

		if(that.showButtons){
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
		}
		var newEl = el.cloneNode(true);
		newEl.style.height = '100%';
		newEl.style.width = '100%';
		this.element.appendChild(newEl);
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

	function _itemize(el, index) {
		
		item = new Item(el, index);
		that.items.push(item);
		that.container.replaceChild(item.element, el);
		
		var bgPath = el.src ? el.src : (el.style.backgroundImage != "" ? el.style.backgroundImage : (el.getElementsByTagName('img').length ? el.getElementsByTagName('img')[0].src : ''));

		var css = 'position:absolute;background-image:url('+ bgPath +');top:0;left:0;width:0;height:0;';
		item.element.style.cssText = css;
	}

	function _resize() {
		if(window.addEventListener) {
			window.addEventListener('resize', that.update);
		} else if(window.attachEvent){
			window.attachEvent('onresize', that.update);
		}
	}

	function _load(){
		if(window.addEventListener) {
			window.addEventListener('load', _init, false);
		} else if(window.attachEvent){
			window.attachEvent('onload', _init, false);
		}
	}

	function _init() {
		that.unit = Math.floor((that.container.offsetWidth - that.margin * (that.columns + 1)) / that.columns);
		[].slice.call(that.container.querySelectorAll(that.itemTag)).forEach(_itemize);
		_resize();
	}

	that.update = function(){
		that.unit = Math.floor((that.container.offsetWidth - that.margin * (that.columns + 1)) / that.columns);
		that.draw();
	}

	that.startOnWindowLoad ? _load() : _init();

};

Grid.prototype.drawGrid = function() {
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

	if(this.relativeHeight) {
		this.unith = Math.floor((this.container.offsetHeight - this.margin * (this.grid.length + 1)) / this.grid.length);
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
	item.element.style.top = (this.margin + position.y * ((this.relativeHeight ? this.unith : this.unit) + this.margin)) + 'px';
	item.element.style.left = (this.margin + position.x * (this.unit + this.margin)) + 'px';
	item.element.style.width = (item.spanX * (this.unit + this.margin) - this.margin) + 'px';
	item.element.style.height = (item.spanY * ((this.relativeHeight ? this.unith : this.unit) + this.margin) - this.margin) + 'px';
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

	this.drawGrid();

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
