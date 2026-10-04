# ĐẶC TẢ BÀI TOÁN VÀ THIẾT KẾ LEVEL – TETRIS WEB GAME

## 1. Thông tin dự án

**Tên đề tài:** Xây dựng trò chơi Tetris trên nền tảng Web
**Nền tảng:** Trình duyệt Web
**Công nghệ:** HTML5, SCSS/CSS, JavaScript, Canvas, Git/GitHub, IntelliJ IDEA.

## 2. Phát biểu bài toán

Xây dựng trò chơi Tetris trên trình duyệt. Người chơi điều khiển các Tetromino rơi xuống Board, thực hiện di chuyển, xoay và xóa các hàng đã được lấp đầy.

Trò chơi kết thúc khi Tetromino mới không thể xuất hiện tại vị trí Spawn.

Sau khi hoàn thiện Core Game, hệ thống được mở rộng bằng các Level. Mỗi Level phải bổ sung một cơ chế gameplay mới hoặc thay đổi luật xử lý của Core**, từ đó yêu cầu người chơi thay đổi cách chơi.


# 3. Core Game

## 3.1. Thành phần chính

| Thành phần | Mô tả                             |
| ---------- | --------------------------------- |
| Board      | Lưới chơi 10 × 20                 |
| Tetromino  | 7 loại I, O, T, S, Z, J, L        |
| Movement   | Di chuyển trái, phải, rơi xuống   |
| Rotation   | Xoay Tetromino                    |
| Collision  | Kiểm tra biên và block đã khóa    |
| Lock       | Khóa Tetromino vào Board          |
| Line Clear | Xóa hàng đầy                      |
| Score      | Tính điểm theo số hàng bị xóa     |
| Lines      | Theo dõi số hàng đã xóa           |
| Game State | Start, Playing, Paused, Game Over |
| Render     | Hiển thị bằng Canvas              |

## 3.2. Chức năng hỗ trợ

### Next Piece

Hiển thị Tetromino tiếp theo để người chơi chuẩn bị nước đi.

### Hold Piece

Cho phép lưu và đổi Tetromino. Mỗi lượt chỉ được Hold một lần.

### Ghost Piece

Hiển thị vị trí mà Tetromino sẽ rơi xuống nếu thả thẳng.

**Next, Hold và Ghost là tính năng hỗ trợ, không được tính là Level.**


# 4. Luật Core

Mỗi lượt gồm:

```text
Spawn Piece
    ↓
Move / Rotate
    ↓
Gravity
    ↓
Lock
    ↓
Line Clear
    ↓
Update Score / Lines
    ↓
Spawn Next Piece
```

Tetromino chỉ được di chuyển hoặc xoay khi vị trí mới hợp lệ.

**Game Over** xảy ra khi Tetromino mới không thể Spawn.

## 4.1. Tính điểm

| Số dòng xóa | Điểm |
| ----------: | ---: |
|           1 |  100 |
|           2 |  300 |
|           3 |  500 |
|           4 |  800 |

# 5. Nguyên tắc thiết kế Level

Một Level phải tạo ra **thay đổi gameplay thực sự**, tác động đến ít nhất một trong các yếu tố:

* Board.
* Cách đặt Tetromino.
* Khả năng di chuyển hoặc xoay.
* Cách xử lý tình huống.
* Mục tiêu của người chơi.

### Không được tính là Level

* Next Piece.
* Hold Piece.
* Ghost Piece.
* Pause/Restart.
* Chỉ tăng tốc độ rơi.
* Chỉ đổi giao diện hoặc màu sắc.
* Chỉ tăng điểm mà không thay đổi gameplay.

### Mỗi Level cần có

1. Cơ chế mới.
2. Điều kiện kích hoạt.
3. Luật xử lý.
4. Trạng thái cần quản lý.
5. Hiển thị cho người chơi.
6. Điều kiện hoàn thành.
7. Test Case.

Level phải có khả năng thắng thực tế, không làm game trở nên vô lý hoặc quá khó triển khai.


# 6. Level 1 – Garbage Row

## Mục tiêu

Bổ sung cơ chế Board tự thay đổi bằng cách tạo hàng rác.

## Cơ chế

Sau mỗi **4 Tetromino được Lock**, hệ thống thêm một Garbage Row ở phía dưới Board.

```text
■■■■■■■□■■
```

Garbage Row luôn có ít nhất **một ô trống**.

## Luật

* Các hàng hiện tại được đẩy lên.
* Garbage Row được thêm vào phía dưới.
* Garbage được xử lý như block bình thường.
* Nếu hàng được lấp đầy, Line Clear vẫn hoạt động.

## Điều kiện thắng

Xóa được **3 Garbage Row**.

## Trạng thái

```text
piecesSinceGarbage
garbageRowsCreated
garbageRowsCleared
```

## Tác động gameplay

Board không chỉ thay đổi do người chơi mà còn bị hệ thống bổ sung hàng rác, khiến không gian chơi dần bị thu hẹp.

## Test Case

* Sau 4 lượt Lock xuất hiện Garbage Row.
* Garbage Row luôn có ô trống.
* Garbage Row có thể được xóa.
* Chưa đủ 4 lượt thì không tạo Garbage.
* Xóa đủ 3 Garbage Row thì Level hoàn thành.


# 7. Level 2 – Bomb Block

## Mục tiêu

Bổ sung một Bomb có khả năng xóa block trong khu vực giới hạn.

## Cơ chế

Sau mỗi **5 Tetromino được Lock**, hệ thống tạo một Bomb nếu chưa có Bomb đang hoạt động.

Bomb tác động trong vùng **3 × 3**:

```text
□□□
□B□
□□□
```

## Luật

Khi Bomb được kích hoạt:

1. Xác định vị trí Bomb.
2. Xóa các block trong vùng 3 × 3.
3. Xóa Bomb.
4. Kiểm tra lại Line Clear.
5. Tiếp tục game.

Bomb không tác động ra ngoài Board và không được xóa Tetromino đang điều khiển.

## Điều kiện thắng

Kích hoạt thành công **3 Bomb**.

## Trạng thái

```text
bombPosition
bombActive
bombsCreated
bombsUsed
```

## Tác động gameplay

Người chơi phải cân nhắc cách tận dụng Bomb để xử lý khu vực Board thay vì chỉ đặt Tetromino theo cách thông thường.

## Test Case

* Bomb xuất hiện đúng điều kiện.
* Bomb nằm trong Board.
* Bomb chỉ tác động trong vùng 3 × 3.
* Bomb ở giữa, biên và góc đều hoạt động đúng.
* Line Clear vẫn hoạt động sau Bomb.
* Dùng đủ 3 Bomb thì Level hoàn thành.

# 8. Level 3 – Blocked Column

## Mục tiêu

Tạm thời hạn chế một khu vực của Board, buộc người chơi thay đổi vị trí đặt Tetromino.

## Cơ chế

Sau mỗi **6 Tetromino được Lock**, chọn một cột hợp lệ để khóa.

```text
[ ][ ][ ][X][ ][ ][ ][ ][ ][ ]
[ ][ ][ ][X][ ][ ][ ][ ][ ][ ]
[ ][ ][ ][X][ ][ ][ ][ ][ ][ ]
```

Cột bị khóa tồn tại trong **3 lượt Tetromino tiếp theo**.

## Luật

Trong thời gian khóa:

* Tetromino không được chiếm cột bị khóa.
* Di chuyển vào cột khóa bị từ chối.
* Xoay tạo ra vị trí vi phạm cũng bị từ chối.
* Sau 3 lượt, cột được mở lại.

Cột khóa không được làm vô hiệu vùng Spawn.

## Điều kiện thắng

Vượt qua **3 lần Blocked Column** mà không Game Over.

## Trạng thái

```text
blockedColumn
blockedTurns
blockedCount
```

## Tác động gameplay

Người chơi không thể sử dụng toàn bộ chiều rộng Board trong một khoảng thời gian và phải điều chỉnh cách đặt Tetromino.

## Test Case

* Sau 6 lượt xuất hiện cột khóa.
* Tetromino không thể đi vào cột khóa.
* Xoay vào cột khóa bị từ chối.
* Sau 3 lượt cột được mở.
* Cột khóa không chặn toàn bộ vùng Spawn.
* Vượt qua 3 lần thì Level hoàn thành.

# 9. Kết luận

Hệ thống được xây dựng theo cấu trúc:

```text
TETRIS
│
├── CORE GAME
│   ├── Board
│   ├── Tetromino
│   ├── Collision
│   ├── Lock
│   ├── Line Clear
│   └── Score
│
├── FEATURE HỖ TRỢ
│   ├── Next
│   ├── Hold
│   └── Ghost
│
└── LEVEL SYSTEM
    ├── Level 1: Garbage Row
    ├── Level 2: Bomb Block
    └── Level 3: Blocked Column
```
