package tetris;

public class Board {
    private final int width;
    private final int height;
    private final int[][] cells;

    public Board(int width, int height) {
        this.width = width;
        this.height = height;
        this.cells = new int[height][width];
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getCells(int x, int y) {
        return cells[y][x];
    }

    public void setCall(int x, int y, int value){
        cells[y][x] = value;
    }


}
