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
        this.board.reset();
        this.score = 0;
        this.lines = 0;

        this.holdPiece = null;
        this.canHold = true;
        this.state = 'PLAYING';

        this.nextPiece = createPiece(getRandomType());
        this.spawnNextPiece();
    }

    restart() {
        this.start();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
        } else {
            if (this.state === 'PAUSED') {
                this.state = 'PLAYING';
            }
        }
    }

    update(time) {
        if (this.state !== 'PLAYING') return;

        const deltaTime = time - this.lastDropTime;
        if (deltaTime > this.lastDropTime) {
            this.moveDown();
            this.lastDropTime = time;
        }
    }

    moveLeft() {
        if (this.state !== 'PLAYING') return;
        if (!this.board.isCollision(this.currentPiece, this.currentPiece.x - 1, this.currentPiece.y)) {
            this.currentPiece.x--;
        }
    }

    moveRight() {
        if (this.state !== 'PLAYING') return;
        if (this.board.isCollision(this.currentPiece, this.currentPiece.x + 1, this.currentPiece.y)) {
            this.currentPiece.x++;
        }
    }

    moveDown() {
        if (this.state !== 'PLAYING') return;
        if (this.board.isCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
        } else {
            this.lock();
        }
    }

    hardDrop() {
        if (this.state !== 'PLAYING') return;
        this.currentPiece.y = this.getGhostY();
        this.lock();
    }

    rotate() {
        if (this.state !== 'PLAYING') return;
        const newShape = rotateMatrix(this.currentPiece.shape);
        if (!this.board.isCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y, newShape)) {
            this.currentPiece.shape = newShape;
        }
    }

    hold() {
        if (this.state !== 'PLAYING' || this.canHold) return;

        if (this.holdPiece === null) {
            this.holdPiece = this.currentPiece.type;
            this.spawnNextPiece();
        } else {
            let temp = this.currentPiece.type;
            this.currentPiece = createPiece(this.holdPiece);
            this.holdPiece = temp;
        }

        this.canHold = false;
        this.currentPiece.y = 0;
    }

    spawnNextPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = createPiece(getRandomType());

        if (this.board.isCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.state = 'GAME_OVER';
        }

        this.canHold = true;
    }

    lock() {
        this.board.lockPiece(this.currentPiece);

        let linesCleared = this.board.clearLines();
        if (linesCleared > 0) {
            this.handleLinesCleared(linesCleared);
        }

        if (this.state === 'PLAYING') {
            this.spawnNextPiece();
        }
    }

    handleLinesCleared(lineCount) {
        this.lines += lineCount;

        let points = 0;
        if (lineCount === 1) points = 100;
        if (lineCount === 2) points = 300;
        if (lineCount === 3) points = 500;
        if (lineCount === 4) points = 800;
        this.score += points;
    }

    getGhostY() {
        let ghostY = this.currentPiece;
        while (!this.board.isCollision(this.currentPiece, this.currentPiece.x - 1, this.currentPiece.y + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    render(ctx) {
        
    }
}