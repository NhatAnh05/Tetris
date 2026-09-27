package tetris;

public class Game {
    private final Board board;
    private GameState state;
    private Tetromino currentPiece;

    public Game(){
        board = new Board(10, 20);
        state = GameState.START;
    }

    public Board getBoard() {
        return board;
    }

    public GameState getState() {
        return state;
    }

    public void start() {
        state = GameState.PLAYING;
        spawnPiece();
    }

    private void spawnPiece() {
        int[][] shape0 = {
                {1,1},
                {1,1}
        };
        currentPiece = new Tetromino(shape0);

        currentPiece.setX(board.getWidth() / 2 -1);
        currentPiece.setY(0);
    }

    public Tetromino getCurrentPiece() {
        return currentPiece;
    }
}
