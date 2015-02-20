
var Maze = function(options) {
    for (var p in options) {
        this[p] = options[p];
    }
};


Maze.prototype = {
    constructor: Maze,

    width: 0,
    height: 0,
    grid: null,

    startNode: null,
    endNode: null,
    // �Ƿ�ÿ��һ��, �����Ի���.
    alwaysBacktrace: false,

    init: function() {
        this.trace = [];

        this.currentDir = 0;
        this.current = null;

        this.size = this.width * this.height;
        this.initGrid();
        this.onInit();
    },
    initGrid: function() {
        var grid = this.grid = [];
        for (var r = 0; r < this.height; r++) {
            var row = [];
            grid.push(row);
            for (var c = 0; c < this.width; c++) {
                var node = {
                    x: c,
                    y: r,
                    value: 0,
                };
                row.push(node);
            }
        }

    },

    onInit: function() {},

    random: function(min, max) {
        return ((max - min + 1) * Math.random() + min) >> 0;
    },
    getNode: function(c, r) {
        return this.grid[r][c];
    },
    getRandomNode: function() {
        var r = this.random(0, this.height - 1);
        var c = this.random(0, this.width - 1);
        return this.grid[r][c];
    },
    setMark: function(node, value) {
        return node.value |= value;
    },
    removeMark: function(node, value) {
        return node.value &= ~value;
    },
    isMarked: function(node, value) {
        return (node.value & value) === value;
    },

    setStart: function(c, r) {
        var node = this.grid[r][c];
        this.startNode = node;
    },
    setEnd: function(c, r) {
        var node = this.grid[r][c];
        this.endNode = node;
    },

    setCurrent: function(node) {
        this.current = node;

        this.neighbors = this.getValidNeighbors(node);

        if (this.neighbors && node.value === 0) {
            this.trace.push(node);
            this.onTrace(node);
        }
    },
    onTrace: function(node) {

    },
    moveTo: function(node, dir) {
        this.beforeMove(node);
        this.currentDir = dir;
        this.current.value |= dir;
        this.setCurrent(node);
        node.value |= Maze.Direction.opposite[dir];
        this.afterMove(node);
    },
    beforeMove: function(node) {

    },
    afterMove: function(node) {

    },

    generate: function() {
        this.beforeGenrate();
        this.setCurrent(this.startNode);
        this.stepCount = 0;
        while (this.nextStep()) {
            this.stepCount++;
            if (this.isOver() === true) {
                break;
            }
            // console.log(step);
        }
        console.log("Step Count : " + this.stepCount);
        this.afterGenrate();
    },
    beforeGenrate: function() {},
    afterGenrate: function() {},

    // �����Թ�ʱ����ǰ��ֹ����
    isOver: function() {},

    nextStep: function() {
        if (!this.neighbors) {
            this.beforeBacktrace();
            return this.backtrace();
        }
        var n = this.getNeighbor();
        this.moveTo(n[0], n[1]);
        this.updateCurrent();
        return true;
    },
    beforeBacktrace: function() {},
    backtrace: function() {
        var len = this.trace.length;
        while (len > 0) {
            var idx = this.getTraceIndex();
            var node = this.trace[idx];
            var n = this.getValidNeighbors(node);
            if (n) {
                this.current = node;
                this.neighbors = n;
                return true;
            } else {
                this.trace.splice(idx, 1);
                len--;
            }
        }
        return false;
    },


    /***************************************
      ͨ����д���¼�������, ����ʵ�ֲ�ͬ���Թ�Ч��
    **************************************/

    getValidNeighbors: function(node) {
        var n = [];
        var c = node.x;
        var r = node.y;
        var dir, nearNode;

        dir = Maze.Direction.N;
        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        dir = Maze.Direction.E;
        nearNode = this.grid[r][c + 1];
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        dir = Maze.Direction.S;
        nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        dir = Maze.Direction.W;
        nearNode = this.grid[r][c - 1];
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        n = this.updateNeighbors(node, n);

        return n.length > 0 ? n : null;
    },
    updateNeighbors: function(node, neighbors) {
        return neighbors;
    },
    isValid: function(nearNode, node, dir) {
        return nearNode && nearNode.value === 0;
    },

    updateCurrent: function() {
        if (this.alwaysBacktrace) {
            this.backtrace();
        }
    },

    getNeighbor: function() {
        var n = this.neighbors[this.neighbors.length * Math.random() >> 0];
        return n;
    },

    getTraceIndex: function() {
        var idx = this.trace.length - 1;
        return idx;
    },

};


Maze.Direction = {
    N: 1,
    S: 2,
    E: 4,
    W: 8,
    opposite: {
        1: 2,
        2: 1,
        4: 8,
        8: 4
    },
    stepX: {
        1: 0,
        2: 0,
        4: 1,
        8: -1
    },
    stepY: {
        1: -1,
        2: 1,
        4: 0,
        8: 0
    },
};

module.exports = Maze;