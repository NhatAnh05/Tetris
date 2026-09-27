package tetris;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Main {
    public static void main(String[] args) {
        Game game = new Game();
        game.start();

        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Tetris");
            GamePanel gamePanel = new GamePanel(game);

            frame.setContentPane(gamePanel);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.pack();
            frame.setLocationRelativeTo(null);
            frame.setResizable(false);
            frame.setVisible(true);

            // Tạo Game Loop bằng Timer, lặp lại mỗi 500ms (nửa giây)
            Timer timer = new Timer(500, new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    // Logic di chuyển khối xuống
                    // game.update();

                    // Vẽ lại màn hình
                    gamePanel.repaint();
                }
            });
            timer.start();
        });
    }
}