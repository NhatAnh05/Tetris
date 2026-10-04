const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const nextCanvas = document.getElementById('nextCanvas')
const nextCtx = nextCanvas.getContext('2d');

const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const messagesElement = document.getElementById('messages');

const levelSelector = document.getElementById('levelSelect');
const levelDescription = document.getElementById('levelDescription');

const levelDescription = {
    0: 'Tetris cơ bản với Board, Tetromino, di chuyển, xoay, Collision, Lock, Line Clear và tính điểm.',
    1: 'Garbage Row: sau mỗi 4 Tetromino được Lock, hệ thống thêm một hàng rác ở phía dưới Board. Mục tiêu là xóa 3 hàng rác.',
    2: 'Bomb Block: Bomb có thể xóa các block trong vùng 3 × 3. Mục tiêu là kích hoạt 3 Bomb.',
    3: 'Blocked Column: một cột bị khóa tạm thời trong 3 lượt Tetromino. Mục tiêu là vượt qua 3 lần khóa cột.'
};

function updateLevelDescription() {
    levelDescription.textContent = levelDescription[levelSelector.value];
}

const game = new Game();

function resizeCanvas() {

}

function render() {

}

function loop(time = 0) {

}

document.getElementById('startBtn').addEventListener('click', () => {game.start()});
document.getElementById('pauseBtn').addEventListener('click', () => {game.togglePause()});
document.getElementById('restartBtn').addEventListener('click', () => {game.restart()});

document.addEventListener('keydown', (event) => {

});

resizeCanvas();
requestAnimationFrame(loop);