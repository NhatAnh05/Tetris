const TEROMINO_SHAPES = {
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
}

const COLORS = {
    I: '#00ffff',
    O: '#ffff00',
    T: '#800080',
    S: '#00ff00',
    Z: '#ff0000',
    J: '#0000ff',
    L: '#ffa500'
}

function getRandomType() {
    const keys = Object.keys(TEROMINO_SHAPES);
    const randIndex = Math.floor(Math.random() * keys.length);
    return keys[randIndex];
}

function createPiece(type) {
    return {
        type: type,
        shape: TEROMINO_SHAPES[type],
        x: Math.floor(10 /2) - Math.floor(TEROMINO_SHAPES[type][0].length/2),
        y: 0
    }

}

function rotateMatrix(matrix) {
    const N = matrix.length;
    const M = matrix[0].length;
    let result = Array.from({length: M}, () => Array(N).fill(0));

    //Thuật toán cho viêc xoay ma trận của các khối theo chiều kim đồng hôd
    for (let y = 0; y < N; ++y) {
        for (let x = 0; x < N; ++x) {
            result[x][N - 1 - y] = matrix[y][x];
        }
    }

    return result;
}