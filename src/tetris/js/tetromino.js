const TETROMINO_SHAPES = {
    I: [
        [1, 1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

const COLORS = {
    I: '#06b6d4',
    O: '#eab308',
    T: '#8b5cf6',
    S: '#22c55e',
    Z: '#ef4444',
    J: '#3b82f6',
    L: '#f97316',
    G: '#64748b'
};

function getRandomType() {
    const keys = Object.keys(TETROMINO_SHAPES);
    return keys[Math.floor(Math.random() * keys.length)];
}

function cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
}

function createPiece(type) {
    const shape = cloneMatrix(TETROMINO_SHAPES[type]);

    return {
        type,
        shape,
        x: Math.floor((10 - shape[0].length) / 2),
        y: 0
    };
}

function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    const result = Array.from(
        { length: cols },
        () => Array(rows).fill(0)
    );

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            result[col][rows - 1 - row] = matrix[row][col];
        }
    }

    return result;
}
