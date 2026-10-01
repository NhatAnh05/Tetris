class Board {
    // Khởi tạo bàn chơi
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.clear();
    }

    // Reset lại board thành mảng 2 chiều toàn số 0
    clear() {
        this.cells = [];

        for (let y = 0; y < this.height; y++) {
            this.cells.push(new Array(this.width).fill(0));
        }
    }

    // Lấy ID khối tại tọa độ (x, y)
    getCell(x, y) {
        return this.cells[y][x];
    }

    setCell(x, y, value) {
        this.cells[y][x] = value;
    }

    // Check tọa độ coi có bị lọt ra ngoài ranh giới board không
    isInside(x, y) {
        return (
            x >= 0 &&
            x < this.width &&
            y >= 0 &&
            y < this.height
        );
    }

    // Check xem ô đồ có trống không
    isEmpty(x, y) {
        return this.isInside(x, y) && this.cells[y][x] === 0;
    }

    // Quét ngang 1 dòng xem có ô nào bị hổng không
    isRowFull(y) {
        for (let x = 0; x < this.width; x++) {
            if (this.cells[y][x] === 0) {
                return false;
            }
        }

        return true;
    }

    // Thuật toán dọn hàng: Xóa hàng đầy, bù hàng mới vào đỉnh của board
    clearLines() {
        let clearedLines = 0;

        // Chạy nguowojc từ dưới đáy lên đỉnh
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.isRowFull(y)) {
                this.cells.splice(y, 1); // Cắt bỏ dòng đầy
                this.cells.unshift(new Array(this.width).fill(0)); // Rồi nhét dòng số 0 lên đỉnh
                clearedLines++;
                y++; // Giữ nguyên y để check tiếp vì index đã bị xuống
            }
        }

        return clearedLines; // Trả về số dòng ăn được để tính điểm
    }
}
