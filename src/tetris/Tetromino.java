package tetris;

public class Tetromino {
    private int x, y;
    private int[][] shape;

    // Constructor nhận vào hình dáng
    public Tetromino(int[][] shape) {
        this.shape = shape;
        this.x = 0;
        this.y = 0;
    }

    // Constructor nhận cả hình dáng và vị trí khởi tạo
    public Tetromino(int[][] shape, int x, int y) {
        this.shape = shape;
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int[][] getShape() {
        return shape;
    }

    public void setShape(int[][] shape) {
        this.shape = shape;
    }
}