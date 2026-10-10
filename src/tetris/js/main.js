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
const ruleTitleElement = document.getElementById('ruleTitle');
const ruleTextElement = document.getElementById('ruleText');
const ruleGoalElement = document.getElementById('ruleGoal');
const ruleProgressElement = document.getElementById('ruleProgress');

const startButton = document.getElementById('startBtn');
const pauseButton = document.getElementById('pauseBtn');
const restartButton = document.getElementById('restartBtn');
const bombButton = document.getElementById('bombBtn');

const LEVEL_DESCRIPTIONS = {
    0: 'Tetris cơ bản với Board, Tetromino, di chuyển, xoay, Collision, Lock, Line Clear và tính điểm.',
    1: 'Sau mỗi 4 Tetromino được Lock, thêm 1 Garbage Row ở phía dưới. Mục tiêu là xóa 3 Garbage Row.',
    2: 'Sau mỗi 5 Tetromino được Lock, Bomb xuất hiện nếu chưa có Bomb đang hoạt động. Nhấn B hoặc nút Kích nổ để xóa block trong vùng 3×3.',
    3: 'Level 3 - Blocked Column: giai đoạn nền, chuẩn bị trạng thái và cấu trúc cho cơ chế cột bị khóa.'
};

const LEVEL_GOALS = {
    0: 'Mục tiêu: chơi tự do.',
    1: 'Mục tiêu: xóa 3 Garbage Row.',
    2: 'Mục tiêu: kích nổ thành công 3 Bomb.',
    3: 'Mục tiêu dự kiến: vượt qua 3 lần khóa cột (cơ chế chưa triển khai).'
};

const LEVEL_RULES = {
    0: {
        title: 'Level 0 - Core',
        text: 'Tetris cơ bản. Hoàn thành các dòng và cố gắng đạt điểm cao.',
        goal: 'Mục tiêu: chơi tự do.'
    },
    1: {
        title: 'Level 1 - Garbage Row',
        text: 'Sau mỗi 4 quân Lock, một Garbage Row được thêm ở đáy Board và đẩy các hàng lên.',
        goal: 'Mục tiêu: xóa 3 Garbage Row.'
    },
    2: {
        title: 'Level 2 - Bomb Block',
        text: 'Sau mỗi 5 quân Lock, Bomb xuất hiện nếu chưa có Bomb khác. Nhấn B/Kích nổ để xóa block trong vùng 3×3 quanh Bomb. Bomb không xóa Tetromino đang rơi.',
        goal: 'Mục tiêu: kích nổ thành công 3 Bomb.'
    },
    3: {
        title: 'Level 3 - Blocked Column',
        text: 'Giai đoạn nền: đã khai báo trạng thái và điểm reset cho cơ chế cột bị khóa. Logic tạo cột, va chạm và thời hạn cột sẽ được triển khai ở giai đoạn tiếp theo.',
        goal: 'Mục tiêu dự kiến: vượt qua 3 lần khóa cột.'
    }
};

const game = new Game();

function updateLevelText() {
    const level = Number(levelSelector.value);
    const rules = LEVEL_RULES[level] || LEVEL_RULES[0];
    levelDescriptionElement.textContent = LEVEL_DESCRIPTIONS[level] || LEVEL_DESCRIPTIONS[0];
    levelGoalElement.textContent = LEVEL_GOALS[level] || LEVEL_GOALS[0];
    ruleTitleElement.textContent = rules.title;
    ruleTextElement.textContent = rules.text;
    ruleGoalElement.textContent = rules.goal;
}

function updateLevelSelectorState() {
    levelSelector.disabled = ['COUNTDOWN', 'PLAYING', 'PAUSED'].includes(game.state);
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
                messageElement.textContent = `Garbage đã xóa: ${game.garbageRowsCleared}/3`;
            } else if (game.level === 2) {
                const bombText = game.bombActive
                    ? `Bomb tại cột ${game.bombPosition.x + 1}, hàng ${game.bombPosition.y + 1} — nhấn B để kích nổ`
                    : `Bomb đã dùng: ${game.bombsUsed}/3 · ${game.piecesSinceBomb}/5 quân đến lượt Bomb`;
                messageElement.textContent = bombText;
            } else if (game.level === 3) {
                messageElement.textContent = 'Level 3 - Giai đoạn nền đang được phát triển';
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
            if (game.level === 1) {
                messageElement.textContent = 'LEVEL 1 HOÀN THÀNH - Đã xóa 3 Garbage Row';
            } else if (game.level === 2) {
                messageElement.textContent = 'LEVEL 2 HOÀN THÀNH - Đã kích nổ 3 Bomb';
            } else {
                messageElement.textContent = `LEVEL ${game.level} HOÀN THÀNH`;
            }
            messageElement.className = 'message message-complete';
            break;
    }
}

function updateButtons() {
    const canPause = game.state === 'PLAYING' || game.state === 'PAUSED';
    pauseButton.disabled = !canPause;
    pauseButton.textContent = game.state === 'PAUSED' ? 'Resume' : 'Pause';

    startButton.disabled = ['COUNTDOWN', 'PLAYING', 'PAUSED'].includes(game.state);
    bombButton.hidden = game.level !== 2;
    bombButton.disabled = game.state !== 'PLAYING' || !game.bombActive;
    bombButton.textContent = game.bombActive ? 'Kích nổ Bomb (B)' : 'Chưa có Bomb';
}

function updateRuleProgress() {
    if (game.level === 1) {
        ruleProgressElement.textContent = `Đã tạo: ${game.garbageRowsCreated} · Đã xóa: ${game.garbageRowsCleared}/3`;
    } else if (game.level === 2) {
        const activeText = game.bombActive
            ? `Bomb đang hoạt động tại (${game.bombPosition.x + 1}, ${game.bombPosition.y + 1}).`
            : `Tiến độ tạo Bomb: ${game.piecesSinceBomb}/5 lần Lock.`;
        ruleProgressElement.textContent = `Đã kích nổ: ${game.bombsUsed}/3 · Đã tạo: ${game.bombsCreated}. ${activeText}`;
    } else if (game.level === 3) {
        ruleProgressElement.textContent = `Trạng thái nền đã khởi tạo · Đợt khóa cột: ${game.blockedCount}/3 (cơ chế chưa triển khai).`;
    } else {
        ruleProgressElement.textContent = 'Bắt đầu bằng cách nhấn Start.';
    }
}

function render() {
    game.render(ctx);
    levelValueElement.textContent = game.level;
    scoreElement.textContent = game.score;
    linesElement.textContent = game.lines;

    drawMiniPiece(nextCtx, game.nextPiece ? game.nextPiece.type : null);
    drawMiniPiece(holdCtx, game.holdPiece);

    updateMessage();
    updateButtons();
    updateRuleProgress();
    updateLevelSelectorState();
}

function startGame() {
    game.setLevel(Number(levelSelector.value));
    game.start();
}

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', () => game.togglePause());
restartButton.addEventListener('click', () => game.restart());
bombButton.addEventListener('click', () => game.detonateBomb());

levelSelector.addEventListener('change', () => {
    game.setLevel(Number(levelSelector.value));
    updateLevelText();
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(key)) {
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
    if (key === 'b' || key === 'B') {
        game.detonateBomb();
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
