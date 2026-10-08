class Game {
    constructor() {
        this.board = new Board(10, 20);

        this.level = 0;
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;

        this.score = 0;
        this.lines = 0;

        this.piecesSinceGarbage = 0;
        this.garbageRowsCreated = 0;
        this.garbageRowsCleared = 0;

        this.state = 'START';

        this.dropInterval = 850;
        this.lastDropTime = 0;

        this.countdownStartTime = 0;
        this.countdownValue = 0;
    }

    setLevel(level) {
        this.level = Number(level) === 1 ? 1 : 0;
        this.resetToStart();
    }

    resetToStart() {
        this.board.reset();

        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;

        this.score = 0;
        this.lines = 0;

        this.piecesSinceGarbage = 0;
        this.garbageRowsCreated = 0;
        this.garbageRowsCleared = 0;

        this.state = 'START';
        this.lastDropTime = 0;
        this.countdownStartTime = 0;
        this.countdownValue = 0;
    }

    start() {
        this.board.reset();

        this.currentPiece = null;
        this.nextPiece = createPiece(getRandomType());
        this.holdPiece = null;
        this.canHold = true;

        this.score = 0;
        this.lines = 0;

        this.piecesSinceGarbage = 0;
        this.garbageRowsCreated = 0;
        this.garbageRowsCleared = 0;

        this.state = 'COUNTDOWN';
        this.countdownStartTime = 0;
        this.countdownValue = 3;
        this.lastDropTime = 0;

        this.spawnNextPiece();
    }

    restart() {
        this.start();
    }

    togglePause() {
       if (this.state === 'PLAYING') {
           this.state = 'PAUSED';
           return;
       }

       if (this.state === 'PAUSED') {
           this.state = 'PLAYING';
           this.lastDropTime = performance.now();
       }
    }

    update(time) {
        if (this.state === 'COUNTDOWN') {
            const elapsed = time - this.countdownStartTime;

            if (elapsed >= 3000) {
                this.countdownValue = 0;
                this.state = 'PLAYING';
                this.lastDropTime = time;
            } else {
                this.countdownValue = 3 - Math.floor(elapsed/1000);
            }
            return;
        }

        if (this.state !== 'PLAYING' || this.currentPiece) return;

        if (time - this.lastDropTime >= this.dropInterval) {
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

        const rotated = rotateMatrix(this.currentPiece.shape);
        const offsets = [0, -1, 1, -2, 2];

        for (const offset of offsets) {
            const nextX = this.currentPiece.x + offset;

            if (!this.board.isCollision(
                this.currentPiece, nextX, this.currentPiece.y, rotated
            )) {
                this.currentPiece.shape = rotated;
                this.currentPiece.x = nextX;
                return;
            }
        }
    }

    hold() {
        if (this.state !== 'PLAYING' || this.canHold) return;

        const currentType = this.currentPiece.type;

        if (this.holdPiece === null) {
            this.holdPiece = currentType;
            this.spawnNextPiece();
        } else {
            const heldType = this.holdPiece;
            this.holdPiece = currentType;
            this.currentPiece = createPiece(heldType);

            if (this.board.isCollision(
                this.currentPiece,
                this.currentPiece.x,
                this.currentPiece.y
            )) {
                this.state = 'GAME_OVER';
            }
        }

        this.canHold = false;
    }

    spawnNextPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = createPiece(getRandomType());

        this.currentPiece.x = Math.floor(
            (this.board.width - this.currentPiece.shape[0].length) / 2
        );
        this.currentPiece.y = 0;

        if (this.board.isCollision(
            this.currentPiece, this.currentPiece.x, this.currentPiece.y
        )) {
            this.state = 'GAME_OVER';
        }
    }

    lock() {
        if (!this.currentPiece) return;

        this.board.lockPiece(this.currentPiece);

        const result = this.board.clearLines();

        if (result.linesCleared > 0) {
            this.handleLinesCleared(result.linesCleared);
        }

        if (result.garbageRowsCleared > 0) {
            this.garbageRowsCleared += result.garbageRowsCleared;

            if (this.level === 1 && this.garbageRowsCleared >= 3) {
                this.state = 'LEVEL_COMPLETE';
                this.currentPiece = null;
                return;
            }
        }

        if (this.level === 1) {
            this.piecesSinceGarbage++;

            if (this.piecesSinceGarbage >= 4) {
                this.addGarbageRow();
                this.piecesSinceGarbage = 0;

                if (this.state === 'GAME_OVER') {
                    return;
                }
            }
        }

        this.canHold = true;
        this.spawnNextPiece();
    }

    addGarbageRow() {
        const gameOver = this.board.addGarbageRow();
        this.garbageRowsCreated++;

        if (gameOver) {
            this.state = 'GAME_OVER';
        }
    }

    handleLinesCleared(lineCount) {
        this.lines += lineCount;

        let points = 0;
        if (lineCount === 1) points = 100;
        if (lineCount === 2) points = 300;
        if (lineCount === 3) points = 500;
        if (lineCount === 4) points = 800;
        this.score += points[lineCount] || 0;
    }

    getGhostY() {
        let ghostY = this.currentPiece;
        while (!this.board.isCollision(this.currentPiece, this.currentPiece.x - 1, this.currentPiece.y + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    isPlaying() {
        return this.state === 'PLAYING' && this.currentPiece !== null;
    }

    render(ctx) {
        const cellSize = 36;
        const canvasWidth = this.board.width * cellSize;
        const canvasHeight = this.board.height * cellSize;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Nền + lưới
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.strokeStyle = '#263244';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.board.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize + 0.5, 0);
            ctx.lineTo(x * cellSize + 0.5, canvasHeight);
            ctx.stroke();
        }

        for (let y = 0; y <= this.board.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize + 0.5);
            ctx.lineTo(canvasWidth, y * cellSize + 0.5);
            ctx.stroke();
        }

        // Block đã khóa
        for (let row = 0; row < this.board.height; row++) {
            for (let col = 0; col < this.board.width; col++) {
                const cell = this.board.cells[row][col];

                if (cell !== 0) {
                    this.drawCell(
                        ctx,
                        col * cellSize,
                        row * cellSize,
                        COLORS[cell] || '#64748b',
                        cellSize
                    );
                }
            }
        }

        if (this.currentPiece) {
            // Ghost
            const ghostY = this.getGhostY();

            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (!this.currentPiece.shape[row][col]) continue;

                    const drawX = this.currentPiece.x + col;
                    const drawY = ghostY + row;

                    if (drawY < 0) continue;

                    ctx.fillStyle = 'rgba(255,255,255,0.13)';
                    ctx.fillRect(
                        drawX * cellSize + 3,
                        drawY * cellSize + 3,
                        cellSize - 6,
                        cellSize - 6
                    );
                }
            }

            // Piece hiện tại
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (!this.currentPiece.shape[row][col]) continue;

                    const drawX = this.currentPiece.x + col;
                    const drawY = this.currentPiece.y + row;

                    if (drawY < 0) continue;

                    this.drawCell(
                        ctx,
                        drawX * cellSize,
                        drawY * cellSize,
                        COLORS[this.currentPiece.type],
                        cellSize
                    );
                }
            }
        }

        // Overlay của trạng thái game luôn nằm trên board.
        if (this.state === 'COUNTDOWN') {
            this.drawOverlay(
                ctx,
                String(this.countdownValue),
                'Chuẩn bị...'
            );
        } else if (this.state === 'PAUSED') {
            this.drawOverlay(
                ctx,
                'TẠM DỪNG',
                'Nhấn Pause hoặc P để tiếp tục'
            );
        } else if (this.state === 'GAME_OVER') {
            this.drawOverlay(
                ctx,
                'GAME OVER',
                'Nhấn Restart hoặc R để chơi lại'
            );
        } else if (this.state === 'LEVEL_COMPLETE') {
            this.drawOverlay(
                ctx,
                'LEVEL 1 HOÀN THÀNH',
                'Bạn đã xóa đủ 3 Garbage Row'
            );
        }
    }

    drawOverlay(ctx, title, subtitle) {
        const canvasWidth = this.board.width * 36;
        const canvasHeight = this.board.height * 36;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#ffffff';
        const titleSize = /^\d$/.test(title) ? 72 : (title.length > 16 ? 24 : 38);
        ctx.font = `700 ${titleSize}px Arial`;
        ctx.fillText(title, canvasWidth / 2, canvasHeight / 2 - 18);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#e5e7eb';
        ctx.fillText(subtitle, canvasWidth / 2, canvasHeight / 2 + 28);
    }

    drawCell(ctx, x, y, color, cellSize = 36) {
        ctx.fillStyle = color;
        ctx.fillRect(
            x + 1,
            y + 1,
            cellSize - 2,
            cellSize - 2
        );

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.strokeRect(
            x + 1.5,
            y + 1.5,
            cellSize - 3,
            cellSize - 3
        );
    }
}