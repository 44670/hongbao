var express = require('express');
var router = express.Router();

var answerJson = "[[0,1,1,1,1,1,0],[1,0,1,1,1,0,1],[1,1,0,1,0,1,1],[1,1,1,0,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1]]";
var answer = JSON.parse(answerJson);

var rowCount = 8;
var colCount = 7;

function reversePixel(state, row, col) {
	if (row < 0 || col < 0) {
		return;
	}
	if (row >= rowCount || col >= colCount) {
		return;
	}
	state[row][col] = (state[row][col]) ? 0 : 1;
}
		
		
function doClick(map, row, col) {
	reversePixel(map, row, col);
	reversePixel(map, row - 1, col );
	reversePixel(map, row + 1, col );
	reversePixel(map, row, col - 1);
	reversePixel(map, row, col + 1);
}
		
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/start', function(req, res) {
	var map = JSON.parse(answerJson);
	for (var i = 0; i < 100; i++) {
		var row = Math.floor(Math.random() * rowCount);
		var col = Math.floor(Math.random() * colCount);
		doClick(map, row, col);
	}
	req.session.map = JSON.stringify(map);
	req.session.startTime = Date.now();
	res.send(JSON.stringify(map));
});

router.post('/verify', function(req, res) {
	var map = JSON.parse(req.session.map);
	var diff = Date.now() - req.session.startTime;
	var solution = JSON.parse(req.body.solution);
	console.log(solution);
	if ((diff / 1000) > 330) {
		res.send('Time out!');
		return;
	}
	solution.forEach(function(pos) {
		doClick(map, pos[0], pos[1]);
	});
	if (map.toString() != answer.toString()) {
		res.send('Invalid solution!');
		return;
	}
	res.send('Well done! The magic code is 12345678. ');
	return;
	
});

module.exports = router;
