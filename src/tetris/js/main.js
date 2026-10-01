// DOM element ra các biến để xài về sau cho tiện
const canvas = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const linesElement = document.getElementById("lines");
const stateElement = document.getElementById("game-state");

const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const restartButton = document.getElementById("restart-btn");

// Khởi tạo object của game
const game = new Game(
    canvas,
    scoreElement,
    linesElement,
    stateElement
);

// Map sự kiện click chuột
startButton.addEventListener("click", () => {
    game.start();
});

pauseButton.addEventListener("click", () => {
    game.togglePause();
});

restartButton.addEventListener("click", () => {
    game.restart();
});

// Map sự kiện bấm phím. Dùng event.preventDefault() để chặn scroll trình duyệt khi bấm
// nút mũi tên/ space
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            event.preventDefault();
            game.moveLeft();
            break;

        case "ArrowRight":
            event.preventDefault();
            game.moveRight();
            break;

        case "ArrowDown":
            event.preventDefault();
            game.moveDown();
            break;

        case "ArrowUp":
            event.preventDefault();
            game.rotatePiece();
            break;

        case " ": // Bấm Space thì drop kịch xuống sàn
            event.preventDefault();
            game.hardDrop();
            break;

        case "p":
        case "P":
            event.preventDefault();
            game.togglePause();
            break;

        case "r":
        case "R":
            event.preventDefault();
            game.restart();
            break;
    }
});

