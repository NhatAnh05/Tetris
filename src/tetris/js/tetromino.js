class Tetromino {
    // Khởi tạo khối gạch dựa theo chữ cái truyền vào
    constructor(type) {
        this.type = type;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.shape = this.createShape(type); // SHAPE để sinh ra ma trận khối
    }

    // Hardcode ma trận hình học của 7 loại gạch tiểu chuẩn (I, O, T, S, Z, J, )
    createShape(type) {
        switch (type) {
            case "I":
                return [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];

            case "O":
                return [
                    [1, 1],
                    [1, 1]
                ];

            case "T":
                return [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ];

            case "S":
                return [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ];

            case "Z":
                return [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ];

            case "J":
                return [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ];

            case "L":
                return [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ];

            default:
                throw new Error("Tetromino không hợp lệ: " + type);
        }
    }

    // Thuật toán chuyển vị ma trận để xoay khối 90 độ theo chiều kim của đồng hồ
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];

        // Chạy loop biến hàng thành cột, đảo ngược thứ tự
        for (let x = 0; x < cols; x++) {
            const row = [];

            for (let y = rows - 1; y >= 0; y--) {
                row.push(matrix[y][x]);
            }

            rotated.push(row);
        }

        return rotated;
    }

    // Thực thi việc xoay khối
    rotate() {
        if (this.type === "O") {
            return; // Khối vuông (O) xoay làm gì chi cho mất công
        }

        this.shape = this.rotateMatrix(this.shape);
        this.rotation = (this.rotation + 1) % 4; // Dùng để lưu góc xoay 0, 1, 2, 3
    }

    // Tạo bản sao để test trước xem xoay có bị lọt biên hay không
    clone() {
        const piece = new Tetromino(this.type);

        piece.x = this.x;
        piece.y = this.y;
        piece.rotation = this.rotation;
        piece.shape = this.shape.map(row => [...row]);

        return piece;
    }
}
