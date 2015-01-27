# MosaiGrid

Dynamic photo grid

## Usage

CSS inside of head.
```html
<link href="css/grid.css" media="all" rel="stylesheet" type="text/css"/>
```
Javascript right before close body tag.
```html
<script src="js/grid.js" type="text/javascript"></script>
```

And initiate it like this.
```javascript
var grid = new Grid({
	element: '#photos',
	columns: 6,
	margin: 2
});

window.addEventListener('load', function() {
	grid.draw();
}, false);
```

## Demo
http://codepen.io/jimoong/pen/LELaQE

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

TODO: Write license
