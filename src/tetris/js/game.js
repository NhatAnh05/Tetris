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

        // Level1
        this.piecesSinceGarbage = 0;
        this.garbageRowsCreated = 0;
        this.garbageRowsCleared = 0;

        //Level2
        this.piecesSinceBomb = 0;
        this.bombPosition = null;
        this.bombActive = false;
        this.bombsCreated = 0;
        this.bombsUsed = 0;
        this.lastBombBlocksRemoved = 0;

        this.state = 'START';

        this.dropInterval = 850;
        this.lastDropTime = 0;

        this.countdownStartTime = 0;
        this.countdownValue = 0;
    }

    setLevel(level) {
        const selectedLevel = Number(level);

        this.level = [0, 1, 2].includes(selectedLevel) ? selectedLevel : 0;
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

        this.resetBombProgress();

        this.state = 'START';
        this.lastDropTime = 0;
        this.countdownStartTime = 0;
        this.countdownValue = 0;
    }

    resetBombProgress() {
        this.piecesSinceBomb = 0;
        this.bombPosition = null;
        this.bombActive = false;
        this.bombsCreated = 0;
        this.bombsUsed = 0;
        this.lastBombBlocksRemoved = 0;
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

        this.resetBombProgress();

        // Bắt đầu bằng countdown 3 -> 2 -> 1.
        this.state = 'COUNTDOWN';
        // Đặt mốc 0, hệ thống sẽ tự lấy timestamp chuẩn trong frame tiếp theo của hàm update()
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
            this.lastDropTime = 0; // Trigger reset time chuẩn trong update() thay vì dùng performance.now()
        }
    }

    update(time) {
        if (this.state === 'COUNTDOWN') {
            // Khởi tạo thời gian bắt đầu đếm ngược dựa trên timestamp thực tế của loop
            if (this.countdownStartTime === 0) {
                this.countdownStartTime = time;
            }

            const elapsed = time - this.countdownStartTime;

            if (elapsed >= 3000) {
                this.countdownValue = 0;
                this.state = 'PLAYING';
                this.lastDropTime = time;
            } else {
                this.countdownValue = 3 - Math.floor(elapsed / 1000);
            }

            return;
        }

        if (this.state !== 'PLAYING' || !this.currentPiece) return;

        // Khởi tạo lại lastDropTime nếu game vừa Resume từ Pause
        if (this.lastDropTime === 0) {
            this.lastDropTime = time;
        }

        if (time - this.lastDropTime >= this.dropInterval) {
            this.moveDown();
            this.lastDropTime = time;
        }
    }

    moveLeft() {
        if (!this.isPlaying()) return;

        const nextX = this.currentPiece.x - 1;
        if (!this.board.isCollision(this.currentPiece, nextX, this.currentPiece.y)) {
            this.currentPiece.x = nextX;
        }
    }

    moveRight() {
        if (!this.isPlaying()) return;

        const nextX = this.currentPiece.x + 1;
        if (!this.board.isCollision(this.currentPiece, nextX, this.currentPiece.y)) {
            this.currentPiece.x = nextX;
        }
    }

    moveDown() {
        if (!this.isPlaying()) return;

        const nextY = this.currentPiece.y + 1;

        if (!this.board.isCollision(this.currentPiece, this.currentPiece.x, nextY)) {
            this.currentPiece.y = nextY;
            return true;
        }

        this.lock();
        return false;
    }

    hardDrop() {
        if (!this.isPlaying()) return;

        this.currentPiece.y = this.getGhostY();
        this.lock();
    }

    rotate() {
        if (!this.isPlaying()) return;

        const rotated = rotateMatrix(this.currentPiece.shape);
        const offsets = [0, -1, 1, -2, 2];

        for (const offset of offsets) {
            const nextX = this.currentPiece.x + offset;

            if (!this.board.isCollision(
                this.currentPiece,
                nextX,
                this.currentPiece.y,
                rotated
            )) {
                this.currentPiece.shape = rotated;
                this.currentPiece.x = nextX;
                return;
            }
        }
    }

    hold() {
        if (!this.isPlaying() || !this.canHold) return;

        const currentType = this.currentPiece.type;

        if (this.holdPiece === null) {
            this.holdPiece = currentType;
            this.spawnNextPiece();
        } else {
            const heldType = this.holdPiece;
            this.holdPiece = currentType;
            this.currentPiece = createPiece(heldType);

            this.currentPiece.x = Math.floor((this.board.width - this.currentPiece.shape[0].length)/2);
            this.currentPiece.y = 0;

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
            this.currentPiece,
            this.currentPiece.x,
            this.currentPiece.y
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

        if (this.level === 2 && this.state !== 'GAME_OVER') {
            this.piecesSinceBomb++;
            if (this.piecesSinceBomb >= 5) {
                this.piecesSinceBomb = 0;
                if (!this.bombActive) this.createBomb();
            }
        }
    }

    addGarbageRow() {
        const gameOver = this.board.addGarbageRow();
        this.garbageRowsCreated++;

        if (gameOver) {
            this.state = 'GAME_OVER';
        }
    }

    createBomb() {
        if (this.bombActive || this.level !== 2) return false;

        const candidates = [];
        let bestScore = -1;

        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                if (this.isCurrentPieceCell(x, y)) continue;

                let score = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const bx = x + dx;
                        const by = y + dy;
                        if (
                            bx >= 0 && bx < this.board.width &&
                            by >= 0 && by < this.board.height &&
                            this.board.cells[by][bx] !== 0
                        ) {
                            score++;
                        }
                    }
                }

                score += y * 0.01;
                if (score > bestScore) {
                    bestScore = score;
                    candidates.length = 0;
                    candidates.push({ x, y });
                } else if (score === bestScore) {
                    candidates.push({ x, y });
                }
            }
        }

        if (candidates.length === 0) return false;
        this.bombPosition = candidates[Math.floor(Math.random() * candidates.length)];
        this.bombActive = true;
        this.bombsCreated++;
        return true;
    }

    isCurrentPieceCell(x, y) {
        if (!this.currentPiece) return false;
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (!this.currentPiece.shape[row][col]) continue;
                if (
                    this.currentPiece.x + col === x &&
                    this.currentPiece.y + row === y
                ) return true;
            }
        }
        return false;
    }

    //Kích nổ bảng phím B hoặc nút trên giao diện
    detonateBomb() {
        if (
            !this.isPlaying() || this.level !== 2 ||
            !this.bombActive || !this.bombPosition
        ) return false;

        const { x, y } = this.bombPosition;
        let removedBlocks = 0;

        for (let row = Math.max(0, y - 1); row <= Math.min(this.board.height - 1, y + 1); row++) {
            for (let col = Math.max(0, x - 1); col <= Math.min(this.board.width - 1, x + 1); col++) {
                if (this.board.cells[row][col] !== 0) {
                    this.board.cells[row][col] = 0;
                    removedBlocks++;
                }
            }
        }

        this.bombActive = false;
        this.bombPosition = null;
        this.bombsUsed++;

        const result = this.board.clearLines();
        if (result.linesCleared > 0) {
            this.handleLinesCleared(result.linesCleared);
        }
        if (result.garbageRowsCleared > 0) {
            this.garbageRowsCleared += result.garbageRowsCleared;
        }

        this.lastBombBlocksRemoved = removedBlocks;
        if (this.bombsUsed >= 3) {
            this.state = 'LEVEL_COMPLETE';
            this.currentPiece = null;
        }
        return true;
    }

    handleLinesCleared(lineCount) {
        this.lines += lineCount;

        const points = {
            1: 100,
            2: 300,
            3: 500,
            4: 800
        };

        this.score += points[lineCount] || 0;
    }

    getGhostY() {
        if (!this.currentPiece) return 0;

        let ghostY = this.currentPiece.y;

        while (!this.board.isCollision(
            this.currentPiece,
            this.currentPiece.x,
            ghostY + 1
        )) {
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

        // Bomb và phạm vi tác động 3x3.
        if (this.level === 2 && this.bombActive && this.bombPosition) {
            this.drawBomb(ctx, this.bombPosition.x, this.bombPosition.y, cellSize);
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
            const subtitle = this.level === 1
                ? 'Bạn đã xóa đủ 3 Garbage Row'
                : 'Bạn đã kích nổ đủ 3 Bomb';
            this.drawOverlay(ctx, `LEVEL ${this.level} HOÀN THÀNH`, subtitle);
        }
    }

    drawBomb(ctx, x, y, cellSize) {
        // Vùng ảnh hưởng được giới hạn ở Board; vùng ngoài Board không được vẽ.
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
        ctx.lineWidth = 2;
        const left = Math.max(0, x - 1);
        const top = Math.max(0, y - 1);
        const right = Math.min(this.board.width - 1, x + 1);
        const bottom = Math.min(this.board.height - 1, y + 1);
        ctx.fillRect(
            left * cellSize + 2,
            top * cellSize + 2,
            (right - left + 1) * cellSize - 4,
            (bottom - top + 1) * cellSize - 4
        );
        ctx.strokeRect(
            left * cellSize + 3,
            top * cellSize + 3,
            (right - left + 1) * cellSize - 6,
            (bottom - top + 1) * cellSize - 6
        );

        const centerX = (x + 0.5) * cellSize;
        const centerY = (y + 0.5) * cellSize;
        ctx.beginPath();
        ctx.fillStyle = '#ef4444';
        ctx.arc(centerX, centerY + 2, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fecaca';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + 3, centerY - 8);
        ctx.lineTo(centerX + 8, centerY - 14);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('B', centerX, centerY + 2);
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