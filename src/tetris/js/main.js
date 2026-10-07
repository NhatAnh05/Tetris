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
    canvas.width = 300;
    canvas.height = 600;
    nextCanvas.width = 120;
    nextCanvas.height = 120;
    holdCanvas.width = 120;
    holdCanvas.height = 120;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.render(ctx);

    scoreElement.textContent = game.score;
    linesElement.textContent = game.lines;

    if (game.nextPiece) drawMiniPiece(nextCtx, game.nextPiece.type);

    if (game.state === 'GAME_OVER') {
        messagesElement.textContent = "GAME_OVER!";
        messagesElement.style.color = 'red';
    } else if (game.state === 'PAUSED') {
        messagesElement.textContent = "PAUSED";
        messagesElement.style.color = 'yellow';
    } else if (game.state === 'START') {
        messagesElement.textContent = "Nhấn Start để chơi";
        messagesElement.style.color = 'white';
    } else {
        messagesElement.textContent = "Đang chơi (Core Game)";
        messagesElement.style.color = 'white';
    }
}

function drawMiniPiece(ctxMini, type) {
    ctxMini.clearRect(0, 0, 120, 120);
    if (!type) return;

    let shape = TEROMINO_SHAPES[type];
    ctxMini.fillStyle = COLORS[type];

    let offsetX = (120 -shape[0].length*30)/2;
    let offsetY = (120 -shape.length*30)/2;

    for (let r = 0; r < shape.length; r++){
        for (let c = 0; c < shape[r].length; c++){
            if (shape[r][c]){
                ctxMini.fillRect(offsetX + c * 30, offsetY + r * 30, 29, 29);
            }
        }
    }
}

function loop(time = 0) {
    game.update(time);
    render();
    requestAnimationFrame(loop);
}

document.getElementById('startBtn').addEventListener('click', () => {game.start()});
document.getElementById('pauseBtn').addEventListener('click', () => {game.togglePause()});
document.getElementById('restartBtn').addEventListener('click', () => {game.restart()});

document.addEventListener('keydown', (event) => {
    if (game.state !== 'PLAYING') return;

    switch (event.key) {
        case 'ArrowLeft':
            game.moveLeft();
            break;
        case 'ArrowRight':
            game.moveRight();
            break;
        case 'ArrowDown':
            game.moveDown();
            break;
        case 'ArrowUp':
            game.rotate();
            break;
        case ' ':
            game.hardDrop();
            break;
        case 'c':
        case 'C':
            game.hold();
            break;
    }
});


resizeCanvas();
requestAnimationFrame(loop);