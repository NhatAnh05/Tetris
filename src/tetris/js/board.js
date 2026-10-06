class Board {
    constructor(width=10, height=20) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.reset();
    }

    reset() {
        this.cells = Array.from(
            { length: this.height},
            () => Array(this.width).fill(0)
        )
    }

    isCollision(piece, x, y, shape = piece.shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== 0) {
                    let boardX = x + c;
                    let boardY = y + r;

                    // Chạm biên trái, phải và đáy
                    if (boardX < 0 || boardX >= this.width || boardY >= this.height) {
                        return true;
                    }

                    // Chạm vào các khối đã lock (chỉ xét Y >= 0 vì khối có thể mới xuất hiện ở mép trên)
                    if (boardY >= 0 && this.cells[boardY][boardX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece(piece) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c] !== 0) {
                    let boardY = piece.y + r;
                    let boardX = piece.x + c;

                    // Nếu tràn lên board thì bỏ qua giai đoạn gán
                    if (boardY < 0) continue;

                    this.cells[boardY][boardX] = piece.type;
                }
            }
        }
    }

    clearLines() {
        let linesCleard = 0;

        for (let y = this.height - 1; y >= 0; y--){
            let isFull = true;
            for (let x = 0; x < this.width; x++) {
                if (this.cells[y][x] === 0) {
                    isFull = false;
                    break;
                }
            }

            if (isFull) {
                this.cells.splice(y, 1);
                this.cells.unshift(Array(this.width).fill(0));
                linesCleard++;

                y++;
            }
        }
        return linesCleard;
    }
}