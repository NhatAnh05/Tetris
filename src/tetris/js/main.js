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

const LEVEL_DESCRIPTIONS = {
    0: 'Tetris cơ bản: di chuyển, xoay, Collision, Lock, Line Clear và tính điểm.',
    1: 'Sau mỗi 4 Tetromino được Lock, thêm 1 Garbage Row ở đáy. Xóa đủ 3 Garbage Row để hoàn thành.',
    2: 'Sau mỗi 5 lần Lock, Bomb xuất hiện và tự nổ sau khoảng 4 giây. Vụ nổ lấp vùng 3×3 bằng debris và đẩy Garbage Row lên. Chế độ sinh tồn vô tận.',
    3: 'Sau mỗi 6 lần Lock, một cột ngẫu nhiên bị khóa trong 3 lượt. Tránh cột đỏ. Chế độ sinh tồn vô tận.',
    4: 'Sau mỗi 5 lần Lock, gió sẽ đẩy Tetromino sang trái hoặc phải theo nhịp trong 5 giây. Xóa đủ 8 dòng để hoàn thành.',
    5: 'Sau mỗi 6 lần Lock, phím trái/phải bị đảo trong 5 giây. Sống sót qua 3 đợt đảo điều khiển.'
};

const LEVEL_GOALS = {
    0: 'Mục tiêu: chơi tự do và đạt điểm cao.',
    1: 'Mục tiêu: xóa 3 Garbage Row.',
    2: 'Mục tiêu: sinh tồn vô tận trước các vụ nổ Bomb.',
    3: 'Mục tiêu: sinh tồn vô tận qua các đợt khóa cột.',
    4: 'Mục tiêu: xóa 8 dòng trong khi né luồng gió.',
    5: 'Mục tiêu: sống sót qua 3 đợt đảo điều khiển.'
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
        title: 'Level 2 - Bomb Attack',
        text: 'Sau mỗi 5 quân Lock, Bomb xuất hiện. Hết khoảng 4 giây, Bomb tự nổ, thêm block nguy hiểm trong vùng 3×3 và đẩy một Garbage Row lên. Trò chơi diễn ra vô tận đến khi bạn thua.',
        goal: 'Mục tiêu: Sinh tồn vô tận.'
    },
    3: {
        title: 'Level 3 - Blocked Column',
        text: 'Sau mỗi 6 quân Lock, một cột ở bên trái hoặc bên phải bị khóa trong 3 lượt. Tetromino không thể đi vào cột đỏ. Trò chơi diễn ra vô tận đến khi bạn thua.',
        goal: 'Mục tiêu: Sinh tồn vô tận.'
    },
    4: {
        title: 'Level 4 - Wind Gust',
        text: 'Sau mỗi 5 quân Lock, luồng gió xuất hiện trong 5 giây và tự đẩy Tetromino một ô theo hướng trái hoặc phải sau mỗi nhịp. Nếu vị trí bị chặn, quân không bị đẩy qua block hoặc biên.',
        goal: 'Mục tiêu: xóa 8 dòng.'
    },
    5: {
        title: 'Level 5 - Reverse Controls',
        text: 'Sau mỗi 6 quân Lock khi đang ở trạng thái bình thường, điều khiển trái/phải bị đảo trong 5 giây. Tạm dừng sẽ dừng bộ đếm thời gian.',
        goal: 'Mục tiêu: sống sót qua 3 đợt đảo điều khiển.'
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
            switch (game.level) {
                case 1:
                    messageElement.textContent =
                        `Garbage đã xóa: ${game.garbageRowsCleared}/3`;
                    break;

                case 2:
                    if (game.bombActive) {
                        messageElement.textContent =
                            `Bomb tự nổ sau ${Math.ceil(game.bombFuseRemaining / 1000)} giây!`;
                    } else {
                        messageElement.textContent =
                            `Đã nổ: ${game.bombsUsed} · Bomb tiếp theo sau ${game.piecesSinceBomb}/5 lần Lock`;
                    }
                    break;

                case 3:
                    if (game.blockedColumn !== null) {
                        messageElement.textContent =
                            `Cột ${game.blockedColumn + 1} đang khóa · còn ${game.blockedTurns} lượt · đợt ${game.blockedCount + 1}`;
                    } else {
                        messageElement.textContent =
                            `Đã vượt qua ${game.blockedCount} đợt khóa cột · lần tiếp theo sau ${game.piecesSinceBlocked}/6 Lock`;
                    }
                    break;

                case 4:
                    if (game.windActive) {
                        messageElement.textContent =
                            `Gió đang đẩy ${game.windDirection < 0 ? 'sang trái' : 'sang phải'} · còn ${Math.ceil(game.windRemaining / 1000)} giây · dòng ${game.lines}/${game.targetWindLines}`;
                    } else {
                        messageElement.textContent =
                            `Đã xóa ${game.lines}/${game.targetWindLines} dòng · gió tiếp theo sau ${game.piecesSinceWind}/5 lần Lock`;
                    }
                    break;

                case 5:
                    if (game.reverseControlsActive) {
                        messageElement.textContent =
                            `ĐẢO ĐIỀU KHIỂN! Còn ${Math.ceil(game.reverseControlsRemaining / 1000)} giây · vượt qua ${game.reverseWavesSurvived}/3 đợt`;
                    } else {
                        messageElement.textContent =
                            `Đã vượt qua ${game.reverseWavesSurvived}/3 đợt · đợt tiếp theo sau ${game.piecesSinceReverse}/6 Lock`;
                    }
                    break;

                default:
                    messageElement.textContent = 'Đang chơi Level 0';
                    break;
            }

            messageElement.className = 'message message-playing';
            break;

        case 'PAUSED':
            messageElement.textContent =
                'ĐANG TẠM DỪNG - Nhấn Pause hoặc P để tiếp tục';
            messageElement.className = 'message message-paused';
            break;

        case 'GAME_OVER':
            messageElement.textContent =
                'GAME OVER - Nhấn Restart hoặc R để chơi lại';
            messageElement.className = 'message message-over';
            break;

        case 'LEVEL_COMPLETE':
            switch (game.level) {
                case 1:
                    messageElement.textContent =
                        'LEVEL 1 HOÀN THÀNH - Đã xóa 3 Garbage Row';
                    break;

                case 2:
                    messageElement.textContent =
                        'LEVEL 2 HOÀN THÀNH - Đã sử dụng đủ số Bomb yêu cầu';
                    break;

                case 3:
                    messageElement.textContent =
                        'LEVEL 3 HOÀN THÀNH - Đã vượt qua các đợt khóa cột';
                    break;

                case 4:
                    messageElement.textContent =
                        'LEVEL 4 HOÀN THÀNH - Đã xóa đủ 8 dòng';
                    break;

                case 5:
                    messageElement.textContent =
                        'LEVEL 5 HOÀN THÀNH - Đã vượt qua 3 đợt đảo chiều';
                    break;

                default:
                    messageElement.textContent =
                        `LEVEL ${game.level} HOÀN THÀNH`;
                    break;
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
}

function updateRuleProgress() {
    switch (game.level) {
        case 1:
            ruleProgressElement.textContent =
                `Đã tạo: ${game.garbageRowsCreated} · Đã xóa: ${game.garbageRowsCleared}/3`;
            break;

        case 2:
            if (game.bombActive) {
                ruleProgressElement.textContent =
                    `Đã sống sót: ${game.bombsUsed} vụ nổ · Đã tạo: ${game.bombsCreated}. Bomb đang đếm ngược: ${Math.ceil(game.bombFuseRemaining / 1000)} giây.`;
            } else {
                ruleProgressElement.textContent =
                    `Đã sống sót: ${game.bombsUsed} vụ nổ · Đã tạo: ${game.bombsCreated}. Bomb tiếp theo sau ${game.piecesSinceBomb}/5 lần Lock.`;
            }
            break;

        case 3:
            if (game.blockedColumn !== null) {
                ruleProgressElement.textContent =
                    `Đã vượt qua: ${game.blockedCount} đợt. Cột ${game.blockedColumn + 1} đang khóa, còn ${game.blockedTurns} lượt.`;
            } else {
                ruleProgressElement.textContent =
                    `Đã vượt qua: ${game.blockedCount} đợt. Cột tiếp theo sau ${game.piecesSinceBlocked}/6 lần Lock.`;
            }
            break;

        case 4:
            if (game.windActive) {
                ruleProgressElement.textContent =
                    `Gió đang thổi ${game.windDirection < 0 ? 'sang trái' : 'sang phải'} · còn ${Math.ceil(game.windRemaining / 1000)} giây · dòng ${game.lines}/${game.targetWindLines}.`;
            } else {
                ruleProgressElement.textContent =
                    `Số dòng: ${game.lines}/${game.targetWindLines} · Gió tiếp theo sau ${game.piecesSinceWind}/5 lần Lock.`;
            }
            break;

        case 5:
            if (game.reverseControlsActive) {
                ruleProgressElement.textContent =
                    `Đã vượt qua: ${game.reverseWavesSurvived}/3 đợt. Đang đảo chiều: ${Math.ceil(game.reverseControlsRemaining / 1000)} giây.`;
            } else {
                ruleProgressElement.textContent =
                    `Đã vượt qua: ${game.reverseWavesSurvived}/3 đợt. Đợt đảo tiếp theo sau ${game.piecesSinceReverse}/6 lần Lock.`;
            }
            break;

        default:
            ruleProgressElement.textContent = 'Bắt đầu bằng cách nhấn Start.';
            break;
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
