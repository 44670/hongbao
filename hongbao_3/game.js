var Maze = require('./maze');

function createMaze(perfect, braid) {
	var maze = new Maze({
    width: 100,
    height: 100,

    perfect: true,
    braid: false,
    checkOver: false,

    onInit: function() {
        this.checkOver= false;
        this.checkCount = {};
        // this.traceInfo = {};
        this.foundEndNode = false;
    },

    getValidNeighbors: function(node) {
        var n = [];
        var c = node.x;
        var r = node.y;
        var nearNode, dir;

        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        dir = Maze.Direction.N;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        nearNode = this.grid[r][c + 1];
        dir = Maze.Direction.E;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
        dir = Maze.Direction.S;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        nearNode = this.grid[r][c - 1];
        dir = Maze.Direction.W;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        n = this.updateNeighbors(node, n);

        return n.length > 0 ? n : null;
    },

    isValid: function(nearNode, node, dir) {
        if (!nearNode) {
            return false;
        }
        if (nearNode.value === 0) {
            return true;
        }
        if (this.perfect || this.braid) {
            return false;
        }
        var c = nearNode.x,
            r = nearNode.y;
        // 用于生成一种非Perfect迷宫
        this.checkCount[c + "-" + r] = this.checkCount[c + "-" + r] || 0;
        var count = ++this.checkCount[c + "-" + r];
        return Math.random() < 0.3 && count < 3;
    },

    beforeBacktrace: function() {
        if (!this.braid) {
            return;
        }
        var n = [];
        var node = this.current;
        var c = node.x;
        var r = node.y;
        var nearNode, dir, op;

        var first = null;
        var currentDir = this.currentDir;
        var updateNear = function() {
            op = Maze.Direction.opposite[dir];
            if (nearNode && (nearNode.value & op) !== op) {
                n.push([nearNode, dir]);
                if (dir == currentDir) {
                    first = [nearNode, dir];
                }
            }
        };

        dir = Maze.Direction.N;
        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        updateNear();

        if (!first) {
            dir = Maze.Direction.E;
            nearNode = this.grid[r][c + 1];
            updateNear();
        }

        if (!first) {
            dir = Maze.Direction.S;
            nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
            updateNear();
        }

        if (!first) {
            dir = Maze.Direction.W;
            nearNode = this.grid[r][c - 1];
            updateNear();
        }

        n = first || n[n.length * Math.random() >> 0];
        this.moveTo(n[0], n[1]);
    },

    updateCurrent: function() {
        // this.traceInfo[this.current.x + "-" + this.current.y] = this.stepCount;
        if (this.braid) {
            return;
        }
        // 每步有 10% 的概率 进行回溯
        if (Math.random() <= 0.10) {
            this.backtrace();
        }
    },

    getTraceIndex: function() {
        var len = this.trace.length;

        if (this.braid) {
            return len - 1;
        }

        // 按一定的概率随机选择回溯策略
        var r = Math.random();
        var idx = 0;
        if (r < 0.5) {
            idx = len - 1;
        } else if (r < 0.7) {
            idx = len >> 1;
        } else if (r < 0.8) {
            idx = len * Math.random() >> 0;
        }
        return idx;
    },

    afterGenrate: function() {
        if (this.braid) {
            this.setCurrent(this.startNode);
            this.nextStep();
        }
    },

    isOver: function() {
        if (!this.checkOver){
            return false;
        }
        if (this.current == this.endNode) {
            this.foundEndNode = true;
        }
        // 当探索到迷宫终点, 且探索了至少一半的区域时,终止迷宫的生成
        if (this.foundEndNode && this.stepCount >= this.size / 2) {
            return true;
        }
        return false;
    }
});
    maze.perfect = perfect || false;
    maze.braid = braid || false;

    maze.init();
    // maze.setStart(0, 0);
    // maze.setEnd(4, 4);

    var dist;
	
    do {
		maze.startNode = maze.getRandomNode();
        maze.endNode = maze.getRandomNode();
		dist = Math.abs(maze.startNode.x - maze.endNode.x) + Math.abs(maze.startNode.y - maze.endNode.y);
    } while (dist < 50);

    maze.generate();

    return maze;
}

function getNodeValue(maze, row, col) {
	if (row < 0 || col < 0) {
		return '15';
	}
	if (row >= maze.width || col >= maze.height) {
		return '15';
	}
	var v = maze.grid[row][col].value;
	if (maze.endNode == maze.grid[row][col]) {
		v += '|E';
	}
	return v;
}

function getGrid(maze, r, c, rs, cs) {
	var ret = '';
	
	for (var row = r; row < r + rs; row++) {
		for (var col = c; col < c + cs; col++) {
			var t = getNodeValue(maze, row, col);
			ret += t;
			ret += ',';
		}
	}
	return ret;
}




var lastConnectTime = {};
function init(io) {
	io.on('connection', function(socket) {
		var clientIp = socket.handshake.address;
		var lastTime = lastConnectTime[clientIp] || 0;
		console.log('new connection: ' + clientIp);
		var diff = Date.now() - lastTime;
		if (diff / 1000 < 10) {
			socket.emit('msg', 'You are reloading this page too fast, please try again later.');
			console.log('too fast');
			return;
		}
		lastConnectTime[clientIp] = Date.now();
		var maze = createMaze(false, false);
		
		var posR = maze.startNode.y;
		var posC = maze.startNode.x;
		
		function sendMap() {
			socket.emit('map', getGrid(maze, posR - 5, posC - 5, 11, 11));
			if (maze.grid[posR][posC] == maze.endNode) {
				socket.emit('msg', 'Well done. The magic code is 12345678.');
			}
		}
		
		sendMap();
		socket.on('walk', function (data) {
			var dir = 0;
			if (data == 'W') dir = Maze.Direction.N;
			if (data == 'A') dir = Maze.Direction.W;
			if (data == 'S') dir = Maze.Direction.S;
			if (data == 'D') dir = Maze.Direction.E;
			if (dir == 0) {
				return;
			}
			var currentNode = maze.grid[posR][posC];
			if ((currentNode.value & dir) !== dir) {
				return;
			}
			posC += Maze.Direction.stepX[dir];
			posR += Maze.Direction.stepY[dir];
			sendMap();
		});
	});
}

module.exports = {init: init};