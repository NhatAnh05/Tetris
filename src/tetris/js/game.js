class Game {
    constructor() {
        this.board = new Board(10, 20);
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;

        this.score = 0;
        this.lines = 0;
        this.state = 'START';

        this.dropInterval = 700;
        this.lastDropTime = 0;
    }

    start() {

    }

    restart() {

    }

    togglePause() {

    }

    update(time) {

    }

    moveLeft() {

    }

    moveRight() {

    }

    moveDown() {

    }

    hardDrop() {

    }

    rotate() {

    }

    hold() {

    }

    spawnNextPiece() {

    }

    handleLinesCleared(lineCount) {

    }

    getGhostY() {

    }

    render(ctx) {
        
    }
}