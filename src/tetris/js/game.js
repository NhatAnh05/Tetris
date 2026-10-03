class Game {
    constructor(canvas, elements) {
        // Setup Canvas
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.scoreElement = elements.score;
        this.linesElement = elements.lines;
        this.stateElement = elements.state;
        this.levelSelect = elements.levelSelect;
        this.timeLeftElement = elements.timeLeft;
        this.timerBox = elements.timerBox;
        this.levelNote = elements.levelNote;

        this.nextPieceCanvas = elements.nextPieceBoard ||
            document.getElementById("next-piece-board");
        this.nextPieceContext = this.nextPieceCanvas
            ? this.nextPieceCanvas.getContext("2d")
            : null;

        // Bàn chơi tiêu chuẩn với 10 cột, 20 dòng
        this.board = new Board(10, 20);
        this.currentPiece = null;
        this.nextPiece = null;

        this.score = 0;
        this.lines = 0;
        this.state = "START";
        this.currentLevel = 0;

        this.cellSize = 30; // Kích thước mỗi ô vuống là 30px
        this.dropInterval = 500; // Tốc độ rơi: 500ms/block
        this.lastTime = 0;
        this.animationFrameId = null;

        // Level 1 - Time Attack
        this.maxTime = 60;
        this.timeLeft = 0;

        // Hardcode cho bảng màu riêng của từng loại khối
        this.colors = {
            I: "#00bcd4",
            O: "#f1c40f",
            T: "#9b59b6",
            S: "#2ecc71",
            Z: "#e74c3c",
            J: "#3498db",
            L: "#e67e22"
        };

        this.nextPiece = this.createRandomPiece();

        this.updateUI();
        this.draw();
        this.drawNextPiece();
    }

    selectLevel(level) {
        if (this.state === "PLAYING" || this.state === "PAUSED") return;

        this.currentLevel = Number(level);
        this.updateUI();
        this.draw();
        this.drawNextPiece();
    }

    start() {
        if (this.state === "PLAYING" || this.state === "GAME_OVER") return;

        this.state = "PLAYING";
        this.board.clear();
        this.currentPiece = null;
        this.score = 0;
        this.lines = 0;
        this.timeLeft = this.currentLevel === 1 ? this.maxTime : 0;

        if (!this.nextPiece) {
            this.nextPiece = this.createRandomPiece();
        }

        this.spawnPiece();

        this.lastTime = performance.now();
        this.cancelGameLoop();
        this.updateUI();
        this.gameLoop(this.lastTime);
    }

    gameLoop(time) {
        if (this.state !== "PLAYING") return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (this.currentLevel === 1) {
            this.updateTime(deltaTime);
            if (this.state !== "PLAYING") {
                this.updateUI();
                this.draw();
                return;
            }
        }

        if (deltaTime >= this.dropInterval) {
            this.moveDown();
            this.lastTime = time;
        }

        this.draw();

        this.animationFrameId =
            requestAnimationFrame(nextTime => this.gameLoop(nextTime));
    }

    updateTime(deltaTime) {
        this.timeLeft -= deltaTime / 1000;

        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.timeOver();
        }
    }

    cancelGameLoop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    createRandomPiece() {
        const types = ["I", "O", "T", "S", "Z", "J", "L"];
        const index = Math.floor(Math.random() * types.length);
        return new Tetromino(types[index]);
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece || this.createRandomPiece();
        this.nextPiece = this.createRandomPiece();

        const pieceWidth = this.currentPiece.shape[0].length;

        this.currentPiece.x =
            Math.floor((this.board.width - pieceWidth) / 2);

        this.currentPiece.y = 0;

        this.drawNextPiece();

        if (!this.isValidPosition(
            this.currentPiece,
            this.currentPiece.x,
            this.currentPiece.y
        )) {
            this.gameOver();
        }
    }

    drawNextPiece() {
        if (!this.nextPieceCanvas || !this.nextPieceContext) return;

        const context = this.nextPieceContext;
        const canvas = this.nextPieceCanvas;
        const shape = this.nextPiece.shape;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "#1e293b";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const cellSize = 20;
        const width = shape[0].length * cellSize;
        const height = shape.length * cellSize;
        const startX = (canvas.width - width) / 2;
        const startY = (canvas.height - height) / 2;

        context.fillStyle = this.colors[this.nextPiece.type] || "#555555";

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 0) continue;

                const pixelX = startX + x * cellSize;
                const pixelY = startY + y * cellSize;

                context.fillRect(
                    pixelX,
                    pixelY,
                    cellSize,
                    cellSize
                );

                context.strokeStyle = "#222222";
                context.lineWidth = 1;
                context.strokeRect(
                    pixelX,
                    pixelY,
                    cellSize,
                    cellSize
                );
            }
        }
    }

    isValidPosition(piece, offsetX, offsetY) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] === 0) continue;

                const boardX = offsetX + x;
                const boardY = offsetY + y;

                if (
                    boardX < 0 ||
                    boardX >= this.board.width ||
                    boardY < 0 ||
                    boardY >= this.board.height
                ) return false;

                if (this.board.getCell(boardX, boardY) !== 0) {
                    return false;
                }
            }
        }

        return true;
    }

    moveLeft() {
        if (this.state !== "PLAYING" || !this.currentPiece) return;

        const newX = this.currentPiece.x - 1;

        if (this.isValidPosition(
            this.currentPiece,
            newX,
            this.currentPiece.y
        )) {
            this.currentPiece.x = newX;
        }
    }

    moveRight() {
        if (this.state !== "PLAYING" || !this.currentPiece) return;

        const newX = this.currentPiece.x + 1;

        if (this.isValidPosition(
            this.currentPiece,
            newX,
            this.currentPiece.y
        )) {
            this.currentPiece.x = newX;
        }
    }

    moveDown() {
        if (this.state !== "PLAYING" || !this.currentPiece) return false;

        const newY = this.currentPiece.y + 1;

        if (this.isValidPosition(
            this.currentPiece,
            this.currentPiece.x,
            newY
        )) {
            this.currentPiece.y = newY;
            return true;
        }

        this.lockPiece();
        return false;
    }

    hardDrop() {
        if (this.state !== "PLAYING" || !this.currentPiece) return;

        while (this.isValidPosition(
            this.currentPiece,
            this.currentPiece.x,
            this.currentPiece.y + 1
        )) {
            this.currentPiece.y++;
        }

        this.lockPiece();
    }

    rotatePiece() {
        if (this.state !== "PLAYING" || !this.currentPiece) return;

        const rotatedPiece = this.currentPiece.clone();
        rotatedPiece.rotate();

        if (this.isValidPosition(
            rotatedPiece,
            rotatedPiece.x,
            rotatedPiece.y
        )) {
            this.currentPiece = rotatedPiece;
        }
    }

    lockPiece() {
        if (!this.currentPiece) return;

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] === 0) continue;

                const boardX = this.currentPiece.x + x;
                const boardY = this.currentPiece.y + y;

                if (this.board.isInside(boardX, boardY)) {
                    this.board.setCell(
                        boardX,
                        boardY,
                        this.currentPiece.type
                    );
                }
            }
        }

        const clearedLines = this.board.clearLines();

        if (clearedLines > 0) {
            this.lines += clearedLines;
            this.score += this.calculateScore(clearedLines);

            if (this.currentLevel === 1) {
                this.addTimeForLines(clearedLines);
            }
        }

        this.spawnPiece();
        this.updateUI();
    }

    calculateScore(linesCleared) {
        switch (linesCleared) {
            case 1: return 100;
            case 2: return 300;
            case 3: return 500;
            case 4: return 800;
            default: return 0;
        }
    }

    getTimeBonus(linesCleared) {
        switch (linesCleared) {
            case 1: return 2;
            case 2: return 4;
            case 3: return 6;
            case 4: return 10;
            default: return 0;
        }
    }

    addTimeForLines(linesCleared) {
        this.timeLeft = Math.min(
            this.timeLeft + this.getTimeBonus(linesCleared),
            this.maxTime
        );
    }

    togglePause() {
        if (this.state === "PLAYING") {
            this.state = "PAUSED";
            this.cancelGameLoop();
            this.updateUI();
            this.draw();
            return;
        }

        if (this.state === "PAUSED") {
            this.state = "PLAYING";
            this.lastTime = performance.now();
            this.cancelGameLoop();
            this.updateUI();
            this.gameLoop(this.lastTime);
        }
    }

    gameOver() {
        this.state = "GAME_OVER";
        this.cancelGameLoop();
        this.updateUI();
        this.draw();
    }

    timeOver() {
        this.state = "GAME_OVER";
        this.timeLeft = 0;
        this.cancelGameLoop();
        this.updateUI();
        this.draw();
    }

    restart() {
        this.cancelGameLoop();
        this.board.clear();
        this.currentPiece = null;
        this.nextPiece = this.createRandomPiece();

        this.score = 0;
        this.lines = 0;
        this.state = "PLAYING";
        this.timeLeft = this.currentLevel === 1 ? this.maxTime : 0;

        this.spawnPiece();

        this.lastTime = performance.now();
        this.updateUI();
        this.draw();
        this.drawNextPiece();
        this.gameLoop(this.lastTime);
    }

    updateUI() {
        this.scoreElement.textContent = String(this.score);
        this.linesElement.textContent = String(this.lines);

        if (this.currentLevel === 1) {
            this.timeLeftElement.textContent =
                Math.ceil(this.timeLeft) + " giây";

            if (this.timeLeft <= 10 && this.state === "PLAYING") {
                this.timerBox.classList.add("warning");
            } else {
                this.timerBox.classList.remove("warning");
            }
        } else {
            this.timeLeftElement.textContent = "--";
            this.timerBox.classList.remove("warning");
        }

        switch (this.state) {
            case "START":
                this.stateElement.textContent = "SẴN SÀNG";
                break;

            case "PLAYING":
                this.stateElement.textContent = "ĐANG CHƠI";
                break;

            case "PAUSED":
                this.stateElement.textContent = "TẠM DỪNG";
                break;

            case "GAME_OVER":
                this.stateElement.textContent =
                    this.currentLevel === 1 && this.timeLeft === 0
                        ? "TIME OVER"
                        : "GAME OVER";
                break;
        }

        this.levelSelect.value = String(this.currentLevel);
        this.levelSelect.disabled =
            this.state === "PLAYING" ||
            this.state === "PAUSED";

        this.levelNote.textContent =
            this.currentLevel === 0
                ? "Level 0: Core Tetris. Không có giới hạn thời gian."
                : "Level 1 - Time Attack: 60 giây. Xóa dòng để cộng thêm thời gian, tối đa 60 giây.";
    }

    // Canvas Draw: Vẽ ô grid
    drawBoard() {
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                const value = this.board.getCell(x, y);
                const pixelX = x * this.cellSize;
                const pixelY = y * this.cellSize;

                this.context.fillStyle =
                    value === 0
                        ? "#eeeeee"
                        : (this.colors[value] || "#555555");

                this.context.fillRect(
                    pixelX,
                    pixelY,
                    this.cellSize,
                    this.cellSize
                );

                // Kẻ thêm cái viền mỏng mỏng bao khối
                this.context.strokeStyle = "#cccccc";
                this.context.lineWidth = 1;
                this.context.strokeRect(
                    pixelX,
                    pixelY,
                    this.cellSize,
                    this.cellSize
                );
            }
        }
    }

    // Canvas Draw: Vẽ cục gạch đang rớt
    drawCurrentPiece() {
        if (!this.currentPiece) return;

        this.context.fillStyle =
            this.colors[this.currentPiece.type];

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] === 0) continue;

                const pixelX =
                    (this.currentPiece.x + x) * this.cellSize;

                const pixelY =
                    (this.currentPiece.y + y) * this.cellSize;

                this.context.fillRect(
                    pixelX,
                    pixelY,
                    this.cellSize,
                    this.cellSize
                );

                this.context.strokeStyle = "#222222";
                this.context.strokeRect(
                    pixelX,
                    pixelY,
                    this.cellSize,
                    this.cellSize
                );
            }
        }
    }

    // Canvas Draw: Đổ layer mờ mờ đè lên lúc pause/end game
    drawOverlay(message, secondaryMessage = "") {
        this.context.fillStyle =
            "rgba(0, 0, 0, 0.55)";

        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.context.fillStyle = "#ffffff";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.font = "bold 24px Arial";

        this.context.fillText(
            message,
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        if (secondaryMessage) {
            this.context.font = "15px Arial";

            this.context.fillText(
                secondaryMessage,
                this.canvas.width / 2,
                this.canvas.height / 2 + 38
            );
        }
    }

    draw() {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.drawBoard();
        this.drawCurrentPiece();

        if (this.state === "START") {
            this.drawOverlay("NHẤN BẮT ĐẦU");
        } else if (this.state === "PAUSED") {
            this.drawOverlay("TẠM DỪNG");
        } else if (this.state === "GAME_OVER") {
            const message =
                this.currentLevel === 1 && this.timeLeft === 0
                    ? "TIME OVER"
                    : "GAME OVER";

            this.drawOverlay(
                message,
                "Nhấn R hoặc Chơi lại để bắt đầu lại"
            );
        }
    }
}