package tetris;

import javax.swing.*;
import java.awt.*;

public class GamePanel extends JPanel {
    private final Game game;
    private static final int CELL_SIZE = 30;

    public GamePanel(Game game) {
        this.game = game;
        Board board = game.getBoard();

        setPreferredSize(
                new Dimension(
                        board.getWidth() * CELL_SIZE,
                        board.getHeight() * CELL_SIZE
                )
        );
    }

    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        Board board = game.getBoard();

        // 1. Vẽ nền bàn chơi
        g.setColor(Color.BLACK);
        g.fillRect(0, 0, getWidth(), getHeight());

        // 2. Vẽ các block đã khóa trên Board
        for (int y = 0; y < board.getHeight(); y++) {
            for (int x = 0; x < board.getWidth(); x++) {
                if (board.getCells(x, y) > 0) {
                    g.setColor(Color.BLUE);
                    g.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    g.setColor(Color.WHITE);
                    g.drawRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        // 3. Vẽ khối Tetromino đang điều khiển (currentPiece)
        Tetromino currentPiece = game.getCurrentPiece();
        if (currentPiece != null) {
            int[][] shape = currentPiece.getShape();
            int pieceX = currentPiece.getX();
            int pieceY = currentPiece.getY();

            g.setColor(Color.RED); // Tạm thời dùng màu đỏ cho khối đang rơi
            for (int r = 0; r < shape.length; r++) {
                for (int c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] != 0) {
                        int drawX = (pieceX + c) * CELL_SIZE;
                        int drawY = (pieceY + r) * CELL_SIZE;

                        g.fillRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
                        g.setColor(Color.WHITE);
                        g.drawRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
                        g.setColor(Color.RED); // Trả lại màu để vẽ ô tiếp theo
                    }
                }
            }
        }
    }
}