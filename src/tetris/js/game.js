class Game {
    constructor(canvas, scoreElement, linesElement, stateElement) {
        // Setup Canvas
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.scoreElement = scoreElement;
        this.linesElement = linesElement;
        this.stateElement = stateElement;

        // Bàn chơi tiêu chuẩn với 10 cột, 20 dòng
        this.board = new Board(10, 20);
        this.currentPiece = null;

        this.score = 0;
        this.lines = 0;
        this.state = "START";

        this.cellSize = 30; // Kích thước mỗi ô vuống là 30px
        this.dropInterval = 500; // Tốc độ rơi: 500ms/block
        this.lastTime = 0;
        this.animationFrameId = null;

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

        this.updateUI();
        this.draw();
    }

    start() {
        // Đang chơi hoặc thua rồi thì không start đè lên
        if (this.state === "PLAYING") {
            return;
        }

        if (this.state === "GAME_OVER") {
            return;
        }

        this.state = "PLAYING";

        // Khởi tạo khối đầu tiên nếu chưa có
        if (!this.currentPiece) {
            this.spawnPiece();
        }

        this.lastTime = performance.now();
        this.cancelGameLoop();
        this.gameLoop(this.lastTime); // Kích hoạt vòng lặp
        this.updateUI();
    }

    // Logic hoạt động của game, chạy liên tục bằng requestAnimationFrame
    gameLoop(time) {
        if (this.state !== "PLAYING") {
            return;
        }

        const deltaTime = time - this.lastTime;

        // Tới chu kỳ thì ép viên gạch rơi xuống 1 ô
        if (deltaTime >= this.dropInterval) {
            this.moveDown();
            this.lastTime = time;
        }

        this.draw(); // Vẽ lại giao diện mỗi Frame

        this.animationFrameId =
            requestAnimationFrame((nextTime) => this.gameLoop(nextTime));
    }

    // Tắt vòng lặp (dùng trong lúc pause hoặc ngỏm)
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

    // Đẩy 1 khối mới ra sân
    spawnPiece() {
        this.currentPiece = this.createRandomPiece();

        const pieceWidth = this.currentPiece.shape[0].length;

        // Setup tọa độ y trên đỉnh, x ra giữa board
        this.currentPiece.x =
            Math.floor((this.board.width - pieceWidth) / 2);

        this.currentPiece.y = 0;

        // Vừa spam ra mà đã vào gạch cũ -> Bảo game over luôn
        if (!this.isValidPosition(
            this.currentPiece,
            this.currentPiece.x,
            this.currentPiece.y
        )) {
            this.gameOver();
        }
    }

    // Hàm quan trọng nhất: Check collision. Xuyên suốt game dùng liên tục
    isValidPosition(piece, offsetX, offsetY) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] === 0) {
                    continue; // Chỗ trống trong grid khối thì bỏ qua
                }

                const boardX = offsetX + x;
                const boardY = offsetY + y;

                // Quét chạm biên trái, biên phải, đáy
                if (
                    boardX < 0 ||
                    boardX >= this.board.width ||
                    boardY < 0 ||
                    boardY >= this.board.height
                ) {
                    return false;
                }

                // Quét chạm biên trái, biên phải, đáy[cite: 7]
                if (this.board.getCell(boardX, boardY) !== 0) {
                    return false;
                }
            }
        }

        return true;
    }

    // Các hàm move. Luôn check isValid trước, an toàn mới cho biến thay đổi
    moveLeft() {
        if (this.state !== "PLAYING" || !this.currentPiece) {
            return;
        }

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
        if (this.state !== "PLAYING" || !this.currentPiece) {
            return;
        }

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
        if (this.state !== "PLAYING" || !this.currentPiece) {
            return false;
        }

        const newY = this.currentPiece.y + 1;

        // Rơi bình thường nếu vị trí bên dưới rỗng
        if (this.isValidPosition(
            this.currentPiece,
            this.currentPiece.x,
            newY
        )) {
            this.currentPiece.y = newY;
            return true;
        }

        // Chạm đáy hoặc chạm cục khác rồi -> Đóng băng luôn
        this.lockPiece();
        return false;
    }

    // Drop cứng: Dùng vòng while đẩy y xuống tới khi kịch sàn
    hardDrop() {
        if (this.state !== "PLAYING" || !this.currentPiece) {
            return;
        }

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
        if (this.state !== "PLAYING" || !this.currentPiece) {
            return;
        }

        // Clone cục mới ra xoay nháp, ok mới ném vào cục chính (ngừa lỗi đè viền)
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

    // Gắn cứng khối vào board matrix và tính điểm
    lockPiece() {
        if (!this.currentPiece) {
            return;
        }

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] === 0) {
                    continue;
                }

                const boardX = this.currentPiece.x + x;
                const boardY = this.currentPiece.y + y;

                // Set giá trị id loại khối vào vị trí grid
                if (this.board.isInside(boardX, boardY)) {
                    this.board.setCell(
                        boardX,
                        boardY,
                        this.currentPiece.type
                    );
                }
            }
        }

        // Check xem có ăn hàng nào không
        const clearedLines = this.board.clearLines();

        if (clearedLines > 0) {
            this.lines += clearedLines;
            this.score += this.calculateScore(clearedLines);
        }

        // Đẻ khối mới lặp lại quy trình
        this.spawnPiece();
        this.updateUI();
    }

    // Bảng quy đổi điểm: 1 nháy 100đ, tetris 4 nháy 800đ
    calculateScore(linesCleared) {
        switch (linesCleared) {
            case 1:
                return 100;
            case 2:
                return 300;
            case 3:
                return 500;
            case 4:
                return 800;
            default:
                return 0;
        }
    }

    // Handle cờ pause game
    togglePause() {
        if (this.state === "PLAYING") {
            this.state = "PAUSED";
            this.cancelGameLoop();
            this.updateUI();
            this.draw(); // Cập nhật ui lên "TẠM DỪNG"
            return;
        }

        if (this.state === "PAUSED") {
            this.state = "PLAYING";
            this.lastTime = performance.now();
            this.cancelGameLoop();
            this.gameLoop(this.lastTime);
            this.updateUI();
        }
    }

    // Handle cờ thua game
    gameOver() {
        this.state = "GAME_OVER";
        this.cancelGameLoop();
        this.updateUI();
        this.draw();
    }

    // Reset hết mọi thứ ván mới
    restart() {
        this.cancelGameLoop();
        this.board.clear();
        this.currentPiece = null;
        this.score = 0;
        this.lines = 0;
        this.state = "PLAYING";

        this.spawnPiece();
        this.lastTime = performance.now();
        this.updateUI();
        this.draw();
        this.gameLoop(this.lastTime);
    }

    // Update chuỗi HTML
    updateUI() {
        this.scoreElement.textContent = String(this.score);
        this.linesElement.textContent = String(this.lines);

        switch (this.state) {
            case "START": this.stateElement.textContent = "SẴN SÀNG"; break;
            case "PLAYING": this.stateElement.textContent = "ĐANG CHƠI"; break;
            case "PAUSED": this.stateElement.textContent = "TẠM DỪNG"; break;
            case "GAME_OVER": this.stateElement.textContent = "GAME OVER"; break;
        }
    }

    // Canvas Draw: Vẽ ô grid
    drawBoard() {
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                const value = this.board.getCell(x, y);
                const pixelX = x * this.cellSize;
                const pixelY = y * this.cellSize;

                this.context.fillStyle = value === 0 ? "#eeeeee" : (this.colors[value] || "#555555");
                this.context.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);

                // Kẻ thêm cái viền mỏng mỏng bao khối
                this.context.strokeStyle = "#cccccc";
                this.context.lineWidth = 1;
                this.context.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
            }
        }
    }

    // Canvas Draw: Vẽ cục gạch đang rớt
    drawCurrentPiece() {
        if (!this.currentPiece) return;

        this.context.fillStyle = this.colors[this.currentPiece.type];

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] === 0) continue;

                const pixelX = (this.currentPiece.x + x) * this.cellSize;
                const pixelY = (this.currentPiece.y + y) * this.cellSize;

                this.context.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                this.context.strokeStyle = "#222222";
                this.context.lineWidth = 1;
                this.context.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
            }
        }
    }

    // Canvas Draw: Đổ layer mờ mờ đè lên lúc pause/end game
    drawOverlay(message) {
        this.context.fillStyle = "rgba(0, 0, 0, 0.55)";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = "#ffffff";
        this.context.font = "bold 24px Arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
    }

    drawGameOver() {
        this.drawOverlay("GAME OVER");
        this.context.fillStyle = "#ffffff";
        this.context.font = "16px Arial";
        this.context.textAlign = "center";
        this.context.fillText("Nhấn R để chơi lại", this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    // Chạy tổng lại hàm draw, luôn clear sạch canvas cũ trước khi vẽ frame mới
    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBoard();
        this.drawCurrentPiece();

        if (this.state === "START") {
            this.drawOverlay("NHẤN BẮT ĐẦU");
        } else if (this.state === "PAUSED") {
            this.drawOverlay("TẠM DỪNG");
        } else if (this.state === "GAME_OVER") {
            this.drawGameOver();
        }
    }
}