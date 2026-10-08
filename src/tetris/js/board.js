class Board {
    constructor(width = 10, height = 20) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.reset();
    }

    reset() {
        this.cells = Array.from(
            { length: this.height },
            () => Array(this.width).fill(0)
        );
    }

    isCollision(piece, x, y, shape = piece.shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (!shape[row][col]) continue;

                const boardX = x + col;
                const boardY = y + row;

                if (boardX < 0 || boardX >= this.width || boardY >= this.height) {
                    return true;
                }

                if (boardY >= 0 && this.cells[boardY][boardX] !== 0) {
                    return true;
                }
            }
        }

        return false;
    }

    lockPiece(piece) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (!piece.shape[row][col]) continue;

                const boardX = piece.x + col;
                const boardY = piece.y + row;

                if (
                    boardX >= 0 &&
                    boardX < this.width &&
                    boardY >= 0 &&
                    boardY < this.height
                ) {
                    this.cells[boardY][boardX] = piece.type;
                }
            }
        }
    }

    /**
     * Clear các line đầy.
     * Trả về cả số line bình thường và số Garbage Row bị xóa.
     */
    clearLines() {
        let linesCleared = 0;
        let garbageRowsCleared = 0;

        for (let row = this.height - 1; row >= 0; row--) {
            const isFull = this.cells[row].every(cell => cell !== 0);

            if (!isFull) continue;

            if (this.cells[row].includes('G')) {
                garbageRowsCleared++;
            }

            this.cells.splice(row, 1);
            this.cells.unshift(Array(this.width).fill(0));

            linesCleared++;
            row++;
        }

        return {
            linesCleared,
            garbageRowsCleared
        };
    }

    /**
     * Thêm Garbage Row ở dưới cùng.
     * Các hàng hiện tại được đẩy lên.
     * Garbage luôn có ít nhất một ô trống.
     */
    addGarbageRow() {
        const topWasOccupied = this.cells[0].some(cell => cell !== 0);

        const hole = Math.floor(Math.random() * this.width);
        const garbageRow = Array(this.width).fill('G');
        garbageRow[hole] = 0;

        this.cells.shift();
        this.cells.push(garbageRow);

        return topWasOccupied;
    }
}
