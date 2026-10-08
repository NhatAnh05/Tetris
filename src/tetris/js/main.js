const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');

const levelValueElement = document.getElementById('levelValue');
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const messageElement = document.getElementById('gameMessage');

const levelSelector = document.getElementById('levelSelect');
const levelDescriptionElement = document.getElementById('levelDescription');
const levelGoalElement = document.getElementById('levelGoal');

const startButton = document.getElementById('startBtn');
const pauseButton = document.getElementById('pauseBtn');
const restartButton = document.getElementById('restartBtn');

const LEVEL_DESCRIPTIONS = {
    0: 'Tetris cơ bản với Board, Tetromino, di chuyển, xoay, Collision, Lock, Line Clear và tính điểm.',
    1: 'Sau mỗi 4 Tetromino được Lock, thêm 1 Garbage Row ở phía dưới. Mục tiêu là xóa 3 Garbage Row.'
};

const LEVEL_GOALS = {
    0: 'Mục tiêu: chơi tự do.',
    1: 'Mục tiêu: xóa 3 Garbage Row.'
};

const game = new Game();

function updateLevelText() {
    const level = Number(levelSelector.value);

    levelDescriptionElement.textContent = LEVEL_DESCRIPTIONS[level];
    levelGoalElement.textContent = LEVEL_GOALS[level];
}

function updateLevelSelectorState() {
    levelSelector.disabled =
        game.state === 'COUNTDOWN' ||
        game.state === 'PLAYING' ||
        game.state === 'PAUSED';
}

function drawMiniPiece(targetCtx, type) {
    const width = 180;
    const height = 120;
    const cellSize = 26;

    targetCtx.clearRect(0, 0, width, height);
    targetCtx.fillStyle = '#f8fafc';
    targetCtx.fillRect(0, 0, width, height);

    if (!type) return;

    const shape = TETROMINO_SHAPES[type];
    const shapeWidth = shape[0].length * cellSize;
    const shapeHeight = shape.length * cellSize;

    const offsetX = (width - shapeWidth) / 2;
    const offsetY = (height - shapeHeight) / 2;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (!shape[row][col]) continue;

            targetCtx.fillStyle = COLORS[type];
            targetCtx.fillRect(
                offsetX + col * cellSize + 1,
                offsetY + row * cellSize + 1,
                cellSize - 2,
                cellSize - 2
            );

            targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
            targetCtx.strokeRect(
                offsetX + col * cellSize + 1.5,
                offsetY + row * cellSize + 1.5,
                cellSize - 3,
                cellSize - 3
            );
        }
    }
}

function updateMessage() {
    switch (game.state) {
        case 'START':
            messageElement.textContent = 'Nhấn Start để bắt đầu';
            messageElement.className = 'message';
            break;

        case 'COUNTDOWN':
            messageElement.textContent = `Bắt đầu sau ${game.countdownValue}`;
            messageElement.className = 'message message-countdown';
            break;

        case 'PLAYING':
            if (game.level === 1) {
                messageElement.textContent =
                    `Garbage đã xóa: ${game.garbageRowsCleared}/3`;
            } else {
                messageElement.textContent = 'Đang chơi Level 0';
            }
            messageElement.className = 'message message-playing';
            break;

        case 'PAUSED':
            messageElement.textContent = 'ĐANG TẠM DỪNG - Nhấn Pause hoặc P để tiếp tục';
            messageElement.className = 'message message-paused';
            break;

        case 'GAME_OVER':
            messageElement.textContent = 'GAME OVER - Nhấn Restart hoặc R để chơi lại';
            messageElement.className = 'message message-over';
            break;

        case 'LEVEL_COMPLETE':
            messageElement.textContent =
                'LEVEL 1 HOÀN THÀNH - Đã xóa 3 Garbage Row';
            messageElement.className = 'message message-complete';
            break;
    }
}

function updateButtons() {
    pauseButton.disabled =
        game.state !== 'PLAYING' && game.state !== 'PAUSED';

    pauseButton.textContent =
        game.state === 'PAUSED' ? 'Resume' : 'Pause';
}

function render() {
    game.render(ctx);

    levelValueElement.textContent = game.level;
    scoreElement.textContent = game.score;
    linesElement.textContent = game.lines;

    drawMiniPiece(
        nextCtx,
        game.nextPiece ? game.nextPiece.type : null
    );

    drawMiniPiece(
        holdCtx,
        game.holdPiece
    );

    updateMessage();
    updateButtons();
    updateLevelSelectorState();
}

function startGame() {
    game.setLevel(Number(levelSelector.value));
    game.start();
}

startButton.addEventListener('click', startGame);

pauseButton.addEventListener('click', () => {
    game.togglePause();
});

restartButton.addEventListener('click', () => {
    game.restart();
});

levelSelector.addEventListener('change', () => {
    game.setLevel(Number(levelSelector.value));
    updateLevelText();
});

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'ArrowDown' ||
        key === 'ArrowUp' ||
        key === ' '
    ) {
        event.preventDefault();
    }

    if (key === 'p' || key === 'P') {
        game.togglePause();
        return;
    }

    if (key === 'r' || key === 'R') {
        game.restart();
        return;
    }

    if (game.state !== 'PLAYING') return;

    switch (key) {
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

function loop(time) {
    game.update(time);
    render();
    requestAnimationFrame(loop);
}

updateLevelText();
render();
requestAnimationFrame(loop);
