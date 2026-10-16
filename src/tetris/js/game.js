
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

        //Level 1
        this.piecesSinceGarbage = 0;
        this.garbageRowsCreated = 0;
        this.garbageRowsCleared = 0;

        //Level 2
        this.piecesSinceBomb = 0;
        this.bombPosition = null;
        this.bombActive = false;
        this.bombsCreated = 0;
        this.bombsUsed = 0;
        this.lastBombDebrisPlaced = 0;
        this.bombFuseDuration = 4200;
        this.bombFuseRemaining = 0;

        //Level 3
        this.piecesSinceBlocked = 0;
        this.blockedColumn = null;
        this.blockedTurns = 0;
        this.blockedCount = 0;

        //Level 4
        this.piecesSinceWind = 0;
        this.windActive = false;
        this.windRemaining = 0;
        this.windPushRemaining = 0;
        this.windDuration = 5000;
        this.windPushInterval = 800;
        this.windDirection = 1;
        this.targetWindLines = 8;

        this.state = 'START';
        this.baseDropInterval = 850;
        this.dropInterval = this.baseDropInterval;
        this.lastDropTime = 0;
        this.lastFrameTime = 0;
        this.countdownStartTime = 0;
        this.countdownValue = 0;
    }

    setLevel(level) {
        const selectedLevel = Number(level);
        this.level = [0, 1, 2, 3, 4].includes(selectedLevel) ? selectedLevel : 0;
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
        this.resetBlockedColumnProgress();
        this.resetWindProgres();
        this.state = 'START';
        this.dropInterval = this.baseDropInterval;
        this.lastDropTime = 0;
        this.lastFrameTime = 0;
        this.countdownStartTime = 0;
        this.countdownValue = 0;
    }

    resetBombProgress() {
        this.piecesSinceBomb = 0;
        this.bombPosition = null;
        this.bombActive = false;
        this.bombsCreated = 0;
        this.bombsUsed = 0;
        this.lastBombDebrisPlaced = 0;
        this.bombFuseRemaining = 0;
    }

    resetBlockedColumnProgress() {
        this.piecesSinceBlocked = 0;
        this.blockedColumn = null;
        this.blockedTurns = 0;
        this.blockedCount = 0;
    }

    resetWindProgres() {
        this.piecesSinceWind = 0;
        this.windActive = false;
        this.windRemaining = 0;
        this.windPushRemaining = 0;
        this.windDirection = 1;
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
        this.resetBlockedColumnProgress();
        this.resetWindProgres();
        this.dropInterval = this.baseDropInterval;
        this.state = 'COUNTDOWN';
        this.countdownStartTime = 0;
        this.countdownValue = 3;
        this.lastDropTime = 0;
        this.lastFrameTime = 0;
        this.spawnNextPiece();
    }

    restart() {
        this.start();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.lastDropTime = 0;
            this.lastFrameTime = 0;
        }
    }

    update(time) {
        let deltaTime = 0;

        if (this.lastFrameTime !== 0) {
            deltaTime = Math.min(Math.max(0, time - this.lastFrameTime), 100);
        }

        this.lastFrameTime = time;

        if (this.state === 'COUNTDOWN') {
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

        if (this.state !== 'PLAYING' || !this.currentPiece) {
            return;
        }

        if (this.level === 2 && this.bombActive) {
            this.bombFuseRemaining = Math.max(
                0,
                this.bombFuseRemaining - deltaTime
            );

            if (this.bombFuseRemaining <= 0) {
                this.detonateBomb();

                if (this.state !== 'PLAYING') {
                    return;
                }
            }
        }

        if (this.lastDropTime === 0) {
            this.lastDropTime = time;
        }

        if (time - this.lastDropTime >= this.dropInterval) {
            this.moveDown();
            this.lastDropTime = time;
        }
    }

    updateWind(time, deltaTime) {
        //Nếu gió không hoạt động thì không cập nhật thời gian gió
        //Giảm thời gian còn lại của gió
        //Giảm thời gian chờ đên lần tiếp theo
        // Khí dến điểm đẩy, gọi ApplyWindPush()
        //Khi hết 5s gọi endWind()
    }

    startWind() {
        //Kích hoạt trạng thái gió
        // Đặt thời gian gió hoạt động là 5000ms
        // Đặt thời gian chờ lần đẩy đầu tiên là 800ms
        //Chọn hướng gió ngẫu nhiên: trái hoặc phải
    }

    applyWindPush() {
        //Xác định vị trí mới của Tetromino theo hướng gió
        // Kiểm tra va chạm với thành bảng, các khối đã khóa và cột bị chặn nếu có
        // Chí di chuyển Tetrominp khi vị trí hợp lệ
        //Đặt lại bộ đếm để lần đẩy tiếp theo diện ra sau 800ms.
    }

    endWind() {
        //Tắt trạng thái gió
        //Đăt thời gian gió còn lại về 0/
        //Đặt lại bộ đếm thời gian đẩy
    }

    isCollision(piece, x, y, shape = piece.shape) {
        if (this.board.isCollision(piece, x, y, shape)) {
            return true;
        }

        if (this.level !== 3 || this.blockedColumn === null) {
            return false;
        }

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (!shape[row][col]) {
                    continue;
                }

                if (x + col === this.blockedColumn) {
                    return true;
                }
            }
        }

        return false;
    }

    moveLeft() {
        if (!this.isPlaying()) {
            return;
        }

        const nextX = this.currentPiece.x - 1;

        if (!this.isCollision(this.currentPiece, nextX, this.currentPiece.y)) {
            this.currentPiece.x = nextX;
        }
    }

    moveRight() {
        if (!this.isPlaying()) {
            return;
        }

        const nextX = this.currentPiece.x + 1;

        if (!this.isCollision(this.currentPiece, nextX, this.currentPiece.y)) {
            this.currentPiece.x = nextX;
        }
    }

    moveDown() {
        if (!this.isPlaying()) {
            return;
        }

        const nextY = this.currentPiece.y + 1;

        if (!this.isCollision(this.currentPiece, this.currentPiece.x, nextY)) {
            this.currentPiece.y = nextY;
            return true;
        }

        this.lock();
        return false;
    }

    hardDrop() {
        if (!this.isPlaying()) {
            return;
        }

        this.currentPiece.y = this.getGhostY();
        this.lock();
    }

    rotate() {
        if (!this.isPlaying()) {
            return;
        }

        const rotated = rotateMatrix(this.currentPiece.shape);
        const offsets = [0, -1, 1, -2, 2];

        for (const offset of offsets) {
            const nextX = this.currentPiece.x + offset;

            if (!this.isCollision(
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
        if (!this.isPlaying() || !this.canHold) {
            return;
        }

        const currentType = this.currentPiece.type;

        if (this.holdPiece === null) {
            this.holdPiece = currentType;
            this.spawnNextPiece();
        } else {
            const heldType = this.holdPiece;
            this.holdPiece = currentType;
            this.currentPiece = createPiece(heldType);
            this.currentPiece.x = Math.floor(
                (this.board.width - this.currentPiece.shape[0].length) / 2
            );
            this.currentPiece.y = 0;

            if (this.isCollision(
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

        if (this.isCollision(
            this.currentPiece,
            this.currentPiece.x,
            this.currentPiece.y
        )) {
            this.state = 'GAME_OVER';
        }
    }

    lock() {
        if (!this.currentPiece || this.state !== 'PLAYING') {
            return;
        }

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
                this.piecesSinceGarbage = 0;
                this.addGarbageRow();

                if (this.state === 'GAME_OVER') {
                    return;
                }
            }
        }

        if (this.level === 3) {
            this.advanceBlockedColumn();

            if (
                this.state === 'LEVEL_COMPLETE' ||
                this.state === 'GAME_OVER'
            ) {
                return;
            }
        }

        this.canHold = true;
        this.spawnNextPiece();

        if (this.state === 'GAME_OVER') {
            return;
        }

        if (this.level === 2) {
            this.piecesSinceBomb++;

            if (this.piecesSinceBomb >= 5) {
                this.piecesSinceBomb = 0;

                if (!this.bombActive) {
                    this.createBomb();
                }
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
        if (this.bombActive || this.level !== 2) {
            return false;
        }

        const candidates = [];
        let bestScore = -1;

        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                if (this.isCurrentPieceCell(x, y)) {
                    continue;
                }

                let nearbyBlocks = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const bx = x + dx;
                        const by = y + dy;

                        if (
                            bx >= 0 &&
                            bx < this.board.width &&
                            by >= 0 &&
                            by < this.board.height &&
                            this.board.cells[by][bx] !== 0
                        ) {
                            nearbyBlocks++;
                        }
                    }
                }

                const candidateScore = nearbyBlocks + y * 0.01;

                if (candidateScore > bestScore) {
                    bestScore = candidateScore;
                    candidates.length = 0;
                    candidates.push({ x, y });
                } else if (candidateScore === bestScore) {
                    candidates.push({ x, y });
                }
            }
        }

        if (candidates.length === 0) {
            return false;
        }

        this.bombPosition = candidates[
            Math.floor(Math.random() * candidates.length)
            ];

        this.bombActive = true;
        this.bombFuseRemaining = this.bombFuseDuration;
        this.bombsCreated++;

        return true;
    }

    isCurrentPieceCell(x, y) {
        if (!this.currentPiece) {
            return false;
        }

        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (!this.currentPiece.shape[row][col]) {
                    continue;
                }

                if (
                    this.currentPiece.x + col === x &&
                    this.currentPiece.y + row === y
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    detonateBomb() {
        if (
            !this.isPlaying() ||
            this.level !== 2 ||
            !this.bombActive ||
            !this.bombPosition
        ) {
            return false;
        }

        const { x, y } = this.bombPosition;

        const left = Math.max(0, x - 1);
        const right = Math.min(this.board.width - 1, x + 1);
        const top = Math.max(0, y - 1);
        const bottom = Math.min(this.board.height - 1, y + 1);

        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                this.board.cells[row][col] = 0;
            }
        }

        for (let col = 0; col < this.board.width; col++) {
            let writeRow = this.board.height - 1;

            for (let row = this.board.height - 1; row >= 0; row--) {
                const cell = this.board.cells[row][col];

                if (cell !== 0) {
                    this.board.cells[writeRow][col] = cell;

                    if (writeRow !== row) {
                        this.board.cells[row][col] = 0;
                    }

                    writeRow--;
                }
            }

            for (let row = writeRow; row >= 0; row--) {
                this.board.cells[row][col] = 0;
            }
        }

        this.bombActive = false;
        this.bombPosition = null;
        this.bombFuseRemaining = 0;
        this.bombsUsed++;
        this.lastBombDebrisPlaced = 0;

        const result = this.board.clearLines();

        if (result.linesCleared > 0) {
            this.handleLinesCleared(result.linesCleared);
        }

        if (result.garbageRowsCleared > 0) {
            this.garbageRowsCleared += result.garbageRowsCleared;
        }

        const topWasOccupied = this.board.addGarbageRow();

        if (
            topWasOccupied ||
            this.isCollision(
                this.currentPiece,
                this.currentPiece.x,
                this.currentPiece.y
            )
        ) {
            this.state = 'GAME_OVER';
            return true;
        }

        return true;
    }

    advanceBlockedColumn() {
        if (this.blockedColumn !== null) {
            this.blockedTurns--;

            if (this.blockedTurns <= 0) {
                this.blockedColumn = null;
                this.blockedCount++;
            }
        }

        this.piecesSinceBlocked++;

        if (
            this.blockedColumn === null &&
            this.piecesSinceBlocked >= 6
        ) {
            this.piecesSinceBlocked = 0;
            this.createBlockedColumn();
        }
    }

    createBlockedColumn() {
        const possibleColumns = [0, 1, 2, 7, 8, 9];

        this.blockedColumn = possibleColumns[
            Math.floor(Math.random() * possibleColumns.length)
            ];

        this.blockedTurns = 3;
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

    checkWindLevelComplete() {
        //Chỉ xử lý khi người chơi đang ở level 4
        // Kiểm tra tổng số dòng đã cóa có đạt ít nhất 8 dòng hay chưa
        // nếu đạt mục tiêu, chuyển trạng thái game sang level_complete
        // Dừng Tetrimino hiênj tại để tiếp tục chơi sau khi thắng.
    }

    getGhostY() {
        if (!this.currentPiece) {
            return 0;
        }

        let ghostY = this.currentPiece.y;

        while (!this.isCollision(
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

        if (this.level === 3 && this.blockedColumn !== null) {
            const x = this.blockedColumn * cellSize;

            ctx.fillStyle = 'rgba(239, 68, 68, 0.24)';
            ctx.fillRect(x, 0, cellSize, canvasHeight);
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 2;

            for (let row = 0; row < this.board.height; row++) {
                ctx.strokeRect(
                    x + 2,
                    row * cellSize + 2,
                    cellSize - 4,
                    cellSize - 4
                );

                ctx.beginPath();
                ctx.moveTo(x + 11, row * cellSize + 11);
                ctx.lineTo(
                    x + cellSize - 11,
                    row * cellSize + cellSize - 11
                );
                ctx.moveTo(
                    x + cellSize - 11,
                    row * cellSize + 11
                );
                ctx.lineTo(
                    x + 11,
                    row * cellSize + cellSize - 11
                );
                ctx.stroke();
            }
        }

        if (this.level === 2 && this.bombActive && this.bombPosition) {
            this.drawBomb(
                ctx,
                this.bombPosition.x,
                this.bombPosition.y,
                cellSize
            );
        }

        if (this.currentPiece) {
            const ghostY = this.getGhostY();

            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (!this.currentPiece.shape[row][col]) {
                        continue;
                    }

                    const drawX = this.currentPiece.x + col;
                    const drawY = ghostY + row;

                    if (drawY >= 0) {
                        ctx.fillStyle = 'rgba(255,255,255,0.13)';
                        ctx.fillRect(
                            drawX * cellSize + 3,
                            drawY * cellSize + 3,
                            cellSize - 6,
                            cellSize - 6
                        );
                    }
                }
            }

            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (!this.currentPiece.shape[row][col]) {
                        continue;
                    }

                    const drawX = this.currentPiece.x + col;
                    const drawY = this.currentPiece.y + row;

                    if (drawY >= 0) {
                        this.drawCell(
                            ctx,
                            drawX * cellSize,
                            drawY * cellSize,
                            COLORS[this.currentPiece.type] || '#64748b',
                            cellSize
                        );
                    }
                }
            }
        }

        if (this.state === 'COUNTDOWN') {
            this.drawOverlay(ctx, String(this.countdownValue), 'Chuẩn bị...');
        } else if (this.state === 'PAUSED') {
            this.drawOverlay(ctx, 'TẠM DỪNG', 'Nhấn Pause hoặc P để tiếp tục');
        } else if (this.state === 'GAME_OVER') {
            this.drawOverlay(ctx, 'GAME OVER', 'Nhấn Restart hoặc R để chơi lại');
        } else if (this.state === 'LEVEL_COMPLETE') {
            const subtitles = {
                1: 'Bạn đã xóa đủ 3 Garbage Row',
                2: 'Bạn đã sống sót qua 3 vụ nổ Bomb',
                3: 'Bạn đã vượt qua 3 đợt khóa cột'
            };

            this.drawOverlay(
                ctx,
                `LEVEL ${this.level} HOÀN THÀNH`,
                subtitles[this.level] || 'Bạn đã hoàn thành thử thách'
            );
        }
    }

    drawBomb(ctx, x, y, cellSize) {
        const left = Math.max(0, x - 1);
        const top = Math.max(0, y - 1);
        const right = Math.min(this.board.width - 1, x + 1);
        const bottom = Math.min(this.board.height - 1, y + 1);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
        ctx.lineWidth = 2;

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

        ctx.fillStyle = '#fecaca';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(
            `${Math.ceil(this.bombFuseRemaining / 1000)}s`,
            centerX,
            centerY - 22
        );
    }

    drawOverlay(ctx, title, subtitle) {
        const canvasWidth = this.board.width * 36;
        const canvasHeight = this.board.height * 36;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        const titleSize = /^\d$/.test(title)
            ? 72
            : title.length > 16
                ? 24
                : 38;

        ctx.font = `700 ${titleSize}px Arial`;
        ctx.fillText(title, canvasWidth / 2, canvasHeight / 2 - 18);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#e5e7eb';
        ctx.fillText(subtitle, canvasWidth / 2, canvasHeight / 2 + 28);
    }

    drawCell(ctx, x, y, color, cellSize = 36) {
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.strokeRect(
            x + 1.5,
            y + 1.5,
            cellSize - 3,
            cellSize - 3
        );
    }
}
