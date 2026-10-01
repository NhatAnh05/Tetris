# DỰ ÁN TRÒ CHƠI TETRIS

## Đặc tả bài toán và thiết kế Level

Tài liệu này mô tả bài toán, luật chơi, yêu cầu chức năng và cách mở rộng trò chơi Tetris theo từng Level.

Trò chơi được xây dựng dưới dạng **ứng dụng Web**, sử dụng **HTML, CSS và JavaScript**. Phần giao diện được tạo bằng HTML/CSS, trong khi JavaScript xử lý logic trò chơi, điều khiển Tetromino, kiểm tra va chạm, tính điểm và các cơ chế mở rộng.

# MỤC LỤC

1. Phát biểu bài toán
2. Mục tiêu và phạm vi

   * 2.1. Mục tiêu
   * 2.2. Công nghệ sử dụng
   * 2.3. Phạm vi Core Game
3. Khái niệm và trạng thái của trò chơi

   * 3.1. Các thành phần chính
   * 3.2. Trạng thái game
4. Yêu cầu chức năng của Core Tetris
5. Luật xử lý game

   * 5.1. Luật sinh và điều khiển Tetromino
   * 5.2. Luật Line Clear
   * 5.3. Luật Game Over
6. Bài toán tính điểm và xóa dòng
7. Thiết kế hệ thống Level
8. Đặc tả chi tiết Level 1–5

   * Level 1 – Next Piece
   * Level 2 – Hold Piece
   * Level 3 – Ghost Piece
   * Level 4 – Combo
   * Level 5 – Bomb Block
9. Tiêu chí nghiệm thu cho từng Level

   * 9.1. Mẫu đặc tả cho Level tự tạo thêm
10. Cấu trúc dự án
11. Kết luận đặc tả

# 1. Phát biểu bài toán

Xây dựng một trò chơi Tetris chạy trên trình duyệt Web, trong đó người chơi điều khiển các Tetromino rơi xuống một bàn chơi dạng lưới.

Người chơi có thể di chuyển các khối sang trái, phải, rơi nhanh và xoay khối để tìm vị trí phù hợp. Khi một hàng được lấp đầy, hàng đó sẽ được xóa, người chơi nhận điểm và các khối phía trên được dịch xuống.

Trò chơi kết thúc khi một Tetromino mới không thể xuất hiện tại vị trí khởi tạo do bị va chạm với các block đã có trên board.

Sau khi hoàn thiện phần **Core Game**, trò chơi sẽ tiếp tục được mở rộng theo từng **Level**. Mỗi Level bổ sung ít nhất một cơ chế gameplay mới, thay vì chỉ tăng tốc độ rơi của Tetromino.

# 2. Mục tiêu và phạm vi

## 2.1. Mục tiêu

Dự án hướng đến các mục tiêu sau:

* Xây dựng một trò chơi Tetris cơ bản chạy ổn định trên trình duyệt.
* Thiết kế hệ thống đơn giản, dễ tự code, dễ kiểm tra và dễ debug.
* Hoàn thiện phần Core Game trước khi phát triển các Level mở rộng.
* Xây dựng ít nhất 5 Level, trong đó mỗi Level bổ sung một cơ chế mới.
* Mỗi Level có luật riêng, trạng thái riêng nếu cần và test case riêng.
* Không sử dụng source code do AI tạo ra hoặc sao chép nguyên source code để hoàn thành bài.

## 2.2. Công nghệ sử dụng

| Công nghệ         | Vai trò                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **HTML**          | Xây dựng cấu trúc giao diện trò chơi như khu vực Board, Score, Lines và các nút điều khiển.    |
| **CSS**           | Thiết kế giao diện, bố cục, kích thước, màu sắc và trạng thái hiển thị của trò chơi.           |
| **JavaScript**    | Xử lý toàn bộ logic trò chơi, game loop, Tetromino, collision, line clear, score và các Level. |
| **Canvas**        | Hiển thị Board và các Tetromino trong khu vực chơi.                                            |
| **IntelliJ IDEA** | Môi trường phát triển và quản lý mã nguồn.                                                     |
| **Git/GitHub**    | Lưu trữ và quản lý quá trình phát triển dự án.                                                 |

## 2.3. Phạm vi Core Game

| Thành phần     | Mô tả                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Board**      | Lưới chứa các ô trống và các block đã khóa. Board dự kiến có kích thước 10 cột × 20 hàng. |
| **Tetromino**  | Một trong 7 khối chuẩn: I, O, T, S, Z, J, L.                                              |
| **Input**      | Nhận thao tác trái, phải, xuống, xoay và các phím điều khiển cần thiết.                   |
| **Collision**  | Kiểm tra biên board và các block đã tồn tại.                                              |
| **Lock**       | Chuyển Tetromino từ trạng thái đang rơi sang trạng thái cố định trên board.               |
| **Line Clear** | Phát hiện hàng đầy, xóa hàng và dồn các hàng phía trên xuống.                             |
| **Score**      | Tính điểm theo số dòng được xóa và các cơ chế thưởng đã được đặc tả.                      |
| **Game State** | Quản lý các trạng thái Start, Playing, Paused, Game Over và Restart.                      |
| **Render**     | Hiển thị board và Tetromino thông qua Canvas.                                             |

# 3. Khái niệm và trạng thái của trò chơi

## 3.1. Các thành phần chính

| Thành phần     | Thuộc tính gợi ý                          | Vai trò                                            |
| -------------- | ----------------------------------------- | -------------------------------------------------- |
| **Board**      | `width`, `height`, `cells`                | Lưu trạng thái của lưới chơi.                      |
| **Tetromino**  | `type`, `x`, `y`, `rotation`, `shape`     | Đại diện cho khối đang được người chơi điều khiển. |
| **Game**       | `score`, `lines`, `state`, `currentPiece` | Quản lý phiên chơi và các logic chính.             |
| **LevelState** | `currentLevel`, `unlocked`                | Theo dõi Level hiện tại và các feature đã mở.      |
| **NextPiece**  | `nextPiece`                               | Lưu khối tiếp theo từ Level 1 trở lên.             |
| **HoldPiece**  | `holdPiece`, `canHold`                    | Quản lý cơ chế Hold từ Level 2.                    |
| **Combo**      | `combo`, `lastClearAction`                | Theo dõi chuỗi clear từ Level 4.                   |
| **Bomb**       | `position`, `effectArea`                  | Đại diện cho block đặc biệt ở Level 5.             |

## 3.2. Trạng thái game

Luồng trạng thái chính:

```text
START
  ↓
PLAYING <-----> PAUSED
  ↓
GAME OVER
  ↓
RESTART
  ↓
START
```

Trạng thái được quản lý bằng JavaScript để xác định khi nào game được phép nhận input, cập nhật vị trí Tetromino hoặc dừng game loop.

# 4. Yêu cầu chức năng của Core Tetris

| Mã        | Chức năng           | Yêu cầu                                                                      |
| --------- | ------------------- | ---------------------------------------------------------------------------- |
| **FR-01** | Khởi tạo Board      | Tạo bàn chơi đúng kích thước và trạng thái ban đầu là rỗng.                  |
| **FR-02** | Sinh Tetromino      | Sinh một trong bảy Tetromino và đặt tại vị trí khởi tạo.                     |
| **FR-03** | Di chuyển trái/phải | Chỉ cập nhật vị trí nếu vị trí mới hợp lệ.                                   |
| **FR-04** | Rơi xuống           | Tetromino tự động rơi theo game loop và người chơi có thể yêu cầu rơi nhanh. |
| **FR-05** | Xoay                | Xoay Tetromino và từ chối thao tác nếu vị trí mới không hợp lệ.              |
| **FR-06** | Collision           | Phát hiện va chạm với biên Board và các block đã cố định.                    |
| **FR-07** | Lock                | Khi Tetromino không thể rơi tiếp, khối được khóa vào Board.                  |
| **FR-08** | Line Clear          | Xóa tất cả các hàng đã đầy và dồn phần phía trên xuống.                      |
| **FR-09** | Score               | Cập nhật điểm sau khi xóa dòng theo công thức quy định.                      |
| **FR-10** | Game Over           | Khi vị trí spawn không hợp lệ, chuyển trạng thái sang Game Over.             |
| **FR-11** | Restart             | Xóa phiên hiện tại và khởi tạo một phiên chơi mới.                           |
| **FR-12** | Pause               | Tạm dừng input và game loop khi người chơi chọn Pause.                       |
| **FR-13** | Render              | Cập nhật giao diện Canvas sau mỗi thay đổi của game state.                   |

# 5. Luật xử lý game

## 5.1. Luật sinh và điều khiển Tetromino

* Mỗi lượt có một Tetromino hiện tại.
* Tetromino chỉ được thay đổi vị trí nếu trạng thái mới hợp lệ.
* Rotation được xem là một thao tác tạo ra trạng thái vị trí mới. Nếu trạng thái mới không hợp lệ thì không áp dụng rotation.
* Khi Tetromino không thể di chuyển xuống nữa, nó sẽ được lock vào Board.
* Sau khi lock, hệ thống kiểm tra line clear, cập nhật score và sinh Tetromino mới.

## 5.2. Luật Line Clear

Sau khi Tetromino được lock, hệ thống thực hiện:

1. Duyệt các hàng từ dưới lên.
2. Kiểm tra hàng đã đủ ô hay chưa.
3. Nếu hàng đầy thì đánh dấu để xóa.
4. Loại bỏ các hàng đã đầy.
5. Dồn các hàng phía trên xuống.
6. Cập nhật số dòng đã xóa.
7. Tính score dựa trên số dòng và mechanic hiện hành.
8. Cập nhật lại giao diện.

## 5.3. Luật Game Over

Một phiên chơi chuyển sang **Game Over** khi Tetromino mới không thể đặt tại vị trí spawn vì đã va chạm với dữ liệu hiện có trên Board.

Các cơ chế Level không được phép bỏ qua điều kiện Game Over nếu điều đó không được đặc tả riêng.

# 6. Bài toán tính điểm và xóa dòng

Có thể sử dụng bảng điểm đơn giản để việc triển khai và kiểm thử dễ hơn. Đây là công thức đề xuất; nếu giảng viên có công thức chính thức thì sẽ thay bằng công thức đó.

| Số dòng xóa | Điểm cơ bản đề xuất | Mô tả                    |
| ----------: | ------------------: | ------------------------ |
|       **1** |                 100 | Single line clear        |
|       **2** |                 300 | Double line clear        |
|       **3** |                 500 | Triple line clear        |
|       **4** |                 800 | Tetris / four-line clear |

### Nguyên tắc thiết kế

Điểm cơ bản cần được tách khỏi phần thưởng của từng Level.

Ví dụ, khi sử dụng **Combo**, bonus combo chỉ cộng thêm vào điểm thưởng và không làm thay đổi hoặc tính lại điểm gốc của việc xóa dòng.

# 7. THIẾT KẾ HỆ THỐNG LEVEL

Hệ thống Level được xây dựng nhằm mở rộng **cơ chế gameplay** của Core Tetris. Level không được xem đơn giản là việc tăng tốc độ rơi của Tetromino mà phải tạo ra một cách chơi hoặc một quy tắc xử lý mới, khiến người chơi phải thay đổi cách suy nghĩ và chiến thuật.

Mỗi Level hoạt động dựa trên Core Game nhưng bổ sung một tập luật riêng. Khi chuyển sang Level mới, các cơ chế của Level trước có thể được giữ lại nếu không gây xung đột với luật mới.

## 7.1. Nguyên tắc thiết kế Level

Một Level được xem là hoàn chỉnh khi đáp ứng các yêu cầu:

1. Có **ít nhất một cơ chế gameplay mới** làm thay đổi cách vận hành thông thường của Tetris.
2. Có **điều kiện kích hoạt (Trigger)** rõ ràng.
3. Có **trạng thái hoặc dữ liệu mới** để quản lý cơ chế nếu cần.
4. Có **tác động trực tiếp đến Board, Tetromino, Score hoặc điều kiện kết thúc**.
5. Có **phản hồi trực quan** để người chơi biết cơ chế đang hoạt động.
6. Có **test case** cho tình huống bình thường và tình huống biên.
7. Không làm phá vỡ các chức năng cơ bản của Core Game như movement, rotation, collision, lock và line clear.

## 7.2. Cách xác định một Level mới

Trước khi triển khai một Level, cần xác định:

| Tiêu chí              | Nội dung cần xác định                                |
| --------------------- | ---------------------------------------------------- |
| **Tên Level**         | Tên của cơ chế chơi mới                              |
| **Mục tiêu gameplay** | Người chơi cần thích nghi hoặc đạt được điều gì      |
| **Cơ chế mới**        | Logic nào khác với Core Tetris                       |
| **Trigger**           | Sự kiện nào kích hoạt cơ chế                         |
| **State**             | Biến hoặc dữ liệu cần bổ sung                        |
| **Input**             | Người chơi có thao tác mới hay không                 |
| **Tác động**          | Cơ chế ảnh hưởng Board, Tetromino, Score như thế nào |
| **Điều kiện thắng**   | Điều kiện để hoàn thành Level                        |
| **Điều kiện thua**    | Điều kiện thua riêng, nếu có                         |
| **Hiển thị**          | Cách thông báo cơ chế cho người chơi                 |
| **Test case**         | Các trường hợp cần kiểm thử                          |

# 8. ĐẶC TẢ CHI TIẾT LEVEL 1–5

## LEVEL 1 – TIME ATTACK

### Cơ chế: Giới hạn thời gian sinh tồn

### 8.1. Mục tiêu gameplay

Core Tetris cho phép người chơi tiếp tục chơi cho đến khi xảy ra Game Over. Ở Level 1, cách chơi được thay đổi thành **sinh tồn trong một khoảng thời gian giới hạn**.

Người chơi phải vừa xếp khối vừa duy trì thời gian còn lại. Việc xóa dòng trở thành một cơ chế giúp kéo dài thời gian chơi.

### 8.2. Trạng thái mới

| Biến            | Ý nghĩa                                 |
| --------------- | --------------------------------------- |
| `timeLeft`      | Số giây còn lại                         |
| `maxTime`       | Thời gian tối đa                        |
| `timerInterval` | Bộ định thời gian                       |
| `levelState`    | Trạng thái đang chơi hoặc hết thời gian |

### 8.3. Luật chơi

* Khi bắt đầu Level, `timeLeft` được đặt về giá trị ban đầu, ví dụ **60 giây**.
* Mỗi giây, `timeLeft` giảm 1.
* Khi `timeLeft = 0`, game chuyển sang trạng thái **Game Over** ngay lập tức.
* Khi người chơi xóa dòng, thời gian được cộng thêm.
* Có thể sử dụng quy tắc:

   * Xóa 1 dòng: +2 giây.
   * Xóa 2 dòng: +4 giây.
   * Xóa 3 dòng: +6 giây.
   * Xóa 4 dòng: +10 giây.
* Thời gian không được vượt quá `maxTime`, ví dụ 60 giây.

### 8.4. Luồng xử lý

```text
Start Level
      ↓
Set timeLeft = maxTime
      ↓
Tetromino hoạt động bình thường
      ↓
Timer giảm timeLeft mỗi giây
      ↓
Có Line Clear?
   ┌──┴───┐
  Có     Không
   ↓       ↓
Cộng thời gian
   ↓
Kiểm tra timeLeft
      ↓
timeLeft = 0?
   ┌──┴───┐
  Có     Không
   ↓       ↓
Game Over  Tiếp tục
```

### 8.5. Hiển thị

* Hiển thị đồng hồ đếm ngược.
* Có thể sử dụng thanh thời gian.
* Khi thời gian xuống thấp, giao diện có thể chuyển sang trạng thái cảnh báo.
* Khi hết thời gian, hiển thị thông báo **TIME OVER**.

### 8.6. Điều kiện kết thúc

**Thua:** `timeLeft = 0`.

**Ngoài ra:** Game Over tiêu chuẩn của Core Game vẫn được giữ nguyên nếu Tetromino không thể Spawn.

### 8.7. Test case

* Bắt đầu Level → thời gian phải bằng giá trị ban đầu.
* Sau 1 giây → `timeLeft` giảm chính xác 1.
* Xóa 1 dòng → cộng đúng thời gian.
* Xóa 4 dòng → cộng đúng 10 giây.
* Thời gian không vượt `maxTime`.
* Hết thời gian khi Board chưa đầy → vẫn phải Game Over.
* Restart → timer được khởi tạo lại và timer cũ phải được dừng.

# LEVEL 2 – RISING GARBAGE

### Cơ chế: Dòng rác trồi lên từ đáy Board

### 8.8. Mục tiêu gameplay

Level 2 tạo áp lực từ **phía dưới Board**. Nếu người chơi liên tục đặt Tetromino nhưng không xóa được dòng, hệ thống sẽ tạo các dòng rác từ đáy và đẩy toàn bộ Board lên.

Cơ chế này khiến người chơi không thể chỉ liên tục xếp khối mà phải chủ động tạo Line Clear.

### 8.9. Trạng thái mới

| Biến               | Ý nghĩa                                             |
| ------------------ | --------------------------------------------------- |
| `dropCount`        | Số Tetromino đã Lock liên tiếp không tạo Line Clear |
| `garbageThreshold` | Ngưỡng tạo dòng rác                                 |
| `garbageRows`      | Số dòng rác cần thêm                                |
| `garbageHole`      | Vị trí ô trống của dòng rác                         |

### 8.10. Luật chơi

* Sau mỗi lần Tetromino được Lock:

   * Nếu có Line Clear → `dropCount = 0`.
   * Nếu không có Line Clear → `dropCount++`.
* Khi `dropCount` đạt `garbageThreshold`, hệ thống tạo một dòng rác.
* Ví dụ:

```text
garbageThreshold = 5
```

Sau 5 Tetromino liên tiếp không xóa được dòng:

```text
Board hiện tại
      ↓
Đẩy toàn bộ Board lên 1 hàng
      ↓
Thêm 1 dòng Garbage ở đáy
```

* Dòng rác gồm các block đã khóa và có **một ô trống**.
* Vị trí ô trống được chọn ngẫu nhiên.

### 8.11. Luồng xử lý

```text
Lock Tetromino
      ↓
Check Line Clear
   ┌──┴───┐
  Có     Không
   ↓       ↓
dropCount = 0
           ↓
      dropCount++
           ↓
dropCount >= threshold?
       ┌───┴───┐
      Có      Không
       ↓        ↓
Đẩy Board lên   Tiếp tục
       ↓
Tạo Garbage Row
       ↓
Reset dropCount
```

### 8.12. Điều kiện Game Over

Sau khi chèn Garbage Row:

* Nếu một block bị đẩy vượt khỏi giới hạn trên của Board → Game Over.
* Nếu vị trí Spawn của Tetromino mới bị chặn → Game Over theo Core Game.

### 8.13. Hiển thị

* Garbage Row sử dụng màu hoặc texture khác block thông thường.
* Có thể hiển thị bộ đếm:

```text
GARBAGE IN: 2
```

để người chơi biết còn bao nhiêu lượt trước khi dòng rác xuất hiện.

### 8.14. Test case

* Lock 4 khối không Line Clear → chưa sinh Garbage.
* Lock khối thứ 5 → sinh đúng 1 Garbage Row.
* Có Line Clear → `dropCount` reset về 0.
* Garbage Row luôn nằm ở đáy Board.
* Board được đẩy lên đúng 1 hàng.
* Garbage không tạo block ngoài giới hạn Board.
* Nếu Board đầy đến vị trí cần đẩy → Game Over.

# LEVEL 3 – HEAVY GRAVITY

### Cơ chế: Các block rơi độc lập sau khi xóa dòng

### 8.15. Mục tiêu gameplay

Core Tetris xử lý Line Clear bằng cách xóa hàng đầy rồi dồn các hàng phía trên xuống. Level 3 thay đổi hoàn toàn logic này.

Thay vì coi các block phía trên là một khối thống nhất, hệ thống xử lý từng ô hoặc từng cụm block dựa trên **trọng lực độc lập**.

### 8.16. Trạng thái mới

| Biến           | Ý nghĩa                                             |
| -------------- | --------------------------------------------------- |
| `gravityCheck` | Cho biết Board đang trong quá trình xử lý trọng lực |
| `fallingCells` | Danh sách các ô có thể rơi                          |
| `chainCount`   | Số lần phản ứng dây chuyền                          |
| `settling`     | Board đang trong trạng thái ổn định hay chưa        |

### 8.17. Luật chơi

Sau khi Line Clear:

1. Xóa các dòng đầy.
2. Không dồn toàn bộ hàng phía trên xuống như Core Game.
3. Kiểm tra từng ô trên Board.
4. Nếu bên dưới ô đó là khoảng trống, ô được phép rơi xuống.
5. Ô tiếp tục rơi cho đến khi:

   * Chạm đáy Board; hoặc
   * Chạm một block khác.
6. Khi tất cả block ổn định, hệ thống kiểm tra Line Clear một lần nữa.
7. Nếu tiếp tục xuất hiện Line Clear → tạo **Chain Reaction**.

### 8.18. Luồng xử lý

```text
Lock Tetromino
      ↓
Line Clear
      ↓
Xóa dòng
      ↓
Kiểm tra block đang lơ lửng
      ↓
Cho block rơi
      ↓
Board ổn định?
   ┌──┴───┐
  Chưa    Rồi
   ↓       ↓
Tiếp tục  Check Line Clear
               ↓
          Có Line Clear?
           ┌───┴───┐
          Có      Không
           ↓        ↓
       Chain + 1   Hoàn tất
```

### 8.19. Cơ chế điểm

* Line Clear đầu tiên nhận điểm cơ bản.
* Nếu Gravity tạo ra Line Clear tiếp theo, đó được tính là **Chain**.
* Chain có thể tạo thêm điểm thưởng.
* Điểm thưởng phải được tách khỏi điểm Line Clear cơ bản.

Ví dụ:

```text
Base Score = điểm Line Clear
Chain Bonus = số chain × hệ số bonus
Total Score = Base Score + Chain Bonus
```

### 8.20. Hiển thị

* Các block rơi riêng biệt hoặc theo cụm.
* Khi xảy ra Chain có thể hiển thị:

```text
CHAIN x2
CHAIN x3
```

### 8.21. Test case

* Block có khoảng trống phía dưới phải rơi.
* Block không thể rơi xuyên qua block khác.
* Block phải dừng ở vị trí hợp lệ.
* Sau khi rơi, hệ thống phải kiểm tra Line Clear lại.
* Chain tăng đúng số lần.
* Không được xảy ra vòng lặp vô hạn.
* Không tạo block mới trước khi Board ổn định hoàn toàn.

# LEVEL 4 – PENTOMINO EXPANSION

### Cơ chế: Xuất hiện khối 5 ô

### 8.22. Mục tiêu gameplay

Core Game chỉ sử dụng 7 Tetromino chuẩn gồm 4 ô. Level 4 mở rộng hệ thống bằng cách bổ sung các **Pentomino**, tức các hình được tạo từ 5 ô vuông.

Việc xuất hiện khối 5 ô làm thay đổi không gian chiếm dụng và yêu cầu người chơi phải tính toán vị trí đặt khối khác với Tetromino thông thường.

### 8.23. Trạng thái mới

| Biến              | Ý nghĩa                       |
| ----------------- | ----------------------------- |
| `pentominoShapes` | Danh sách hình Pentomino      |
| `pieceType`       | Loại Tetromino hoặc Pentomino |
| `rotationMatrix`  | Ma trận phục vụ Rotation      |
| `pieceSize`       | Kích thước ma trận của Piece  |

### 8.24. Luật chơi

* Pool khối được mở rộng từ:

```text
I, O, T, S, Z, J, L
```

thành:

```text
Tetromino + Pentomino
```

* Mỗi lần Spawn có thể sinh Tetromino hoặc Pentomino theo xác suất đã định.
* Pentomino chứa 5 ô thay vì 4 ô.
* Collision phải kiểm tra tất cả các ô của Pentomino.
* Rotation phải sử dụng ma trận phù hợp với kích thước khối.
* Piece không được xoay ra ngoài Board.
* Piece không được chồng lên block đã khóa.

### 8.25. Luồng xử lý

```text
Generate Random Piece
        ↓
Kiểm tra loại Piece
   ┌────┴─────┐
Tetromino   Pentomino
   ↓            ↓
Matrix 4x4    Matrix phù hợp
        ↓
Movement / Rotation
        ↓
Collision Check
        ↓
Lock vào Board
        ↓
Line Clear
```

### 8.26. Điểm khác biệt gameplay

Người chơi phải thay đổi chiến thuật bởi:

* Pentomino chiếm nhiều ô hơn.
* Một số hình có chiều rộng hoặc chiều cao lớn.
* Khoảng trống nhỏ trên Board khó tận dụng hơn.
* Rotation có thể tạo ra cách chiếm không gian hoàn toàn khác.

### 8.27. Hiển thị

* Pentomino phải có hình dạng dễ phân biệt.
* Canvas phải render đầy đủ cả 5 ô.
* Khu vực Next Piece cũng phải hiển thị đúng kích thước hình.

### 8.28. Test case

* Tetromino vẫn hoạt động như Core Game.
* Pentomino Spawn đúng hình dạng.
* Pentomino di chuyển được trái/phải/xuống.
* Pentomino không vượt khỏi biên Board.
* Rotation Pentomino không làm mất hoặc nhân bản ô.
* Pentomino không thể xuyên qua block.
* Tetromino và Pentomino có thể cùng tồn tại trên Board.
* Line Clear vẫn hoạt động sau khi Pentomino được Lock.

# LEVEL 5 – TARGET BREAK

### Cơ chế: Phá mục tiêu để hoàn thành Level

### 8.29. Mục tiêu gameplay

Level 5 chuyển mục tiêu của Tetris từ **chỉ tạo điểm cao và tránh Game Over** sang một mục tiêu cụ thể.

Trên Board xuất hiện các **Target Block**. Người chơi phải tạo Line Clear đi qua vị trí chứa Target để phá hủy các mục tiêu này.

### 8.30. Trạng thái mới

| Biến               | Ý nghĩa                       |
| ------------------ | ----------------------------- |
| `targetBlocks`     | Danh sách Target trên Board   |
| `targetHP`         | Số lần Target cần bị tác động |
| `remainingTargets` | Số Target chưa bị phá         |
| `levelCleared`     | Trạng thái hoàn thành Level   |

### 8.31. Luật chơi

* Khi bắt đầu Level, hệ thống tạo một số Target Block trên Board.
* Target được đặt ở các vị trí đã xác định trước hoặc được sinh theo quy tắc.
* Target không tự rơi như Tetromino.
* Target hoạt động như một vật cản đặc biệt trên Board.
* Khi một hàng chứa Target được Line Clear:

   * Target bị tác động.
   * `targetHP` giảm 1.
* Khi `targetHP = 0`, Target bị phá hủy.
* Sau mỗi lần xử lý Line Clear, hệ thống kiểm tra:

```text
remainingTargets == 0 ?
```

Nếu đúng, Level hoàn thành.

### 8.32. Luồng xử lý

```text
Initialize Board
      ↓
Create Target Blocks
      ↓
Gameplay bình thường
      ↓
Lock Tetromino
      ↓
Line Clear
      ↓
Kiểm tra hàng bị xóa
      ↓
Có Target trong hàng?
   ┌──┴───┐
  Có     Không
   ↓       ↓
Target HP - 1
   ↓
HP = 0?
   ┌──┴───┐
  Có     Không
   ↓       ↓
Remove Target
   ↓
Kiểm tra Target còn lại
   ↓
Không còn Target?
   ┌──┴───┐
  Có     Không
   ↓       ↓
LEVEL CLEAR  Tiếp tục
```

### 8.33. Điều kiện thắng

Level được hoàn thành khi:

```text
remainingTargets == 0
```

Sau đó hệ thống chuyển sang trạng thái:

```text
LEVEL CLEARED
```

### 8.34. Điều kiện thua

Người chơi vẫn có thể thua theo luật Core Game:

* Tetromino không thể Spawn.
* Board bị lấp đầy và không thể tiếp tục chơi.

Trong Level 5, **Game Over và Level Cleared là hai trạng thái khác nhau**.

### 8.35. Hiển thị

Target Block cần có thiết kế khác block thông thường.

Có thể hiển thị:

```text
TARGET: 3
```

hoặc:

```text
TARGET HP: 2
```

Khi phá được Target, giao diện cập nhật số lượng Target còn lại.

Khi phá toàn bộ Target:

```text
LEVEL CLEARED
```

### 8.36. Test case

* Khi bắt đầu Level, Target được tạo đúng số lượng.
* Target có đúng vị trí ban đầu.
* Tetromino va chạm với Target đúng như block bình thường.
* Line Clear chứa Target phải làm giảm HP đúng 1.
* Target không bị giảm HP khi hàng khác được xóa.
* Target phải biến mất khi HP đạt 0.
* `remainingTargets` cập nhật chính xác.
* Khi không còn Target, trạng thái phải chuyển sang `levelCleared`.
* Restart phải tạo lại danh sách Target.
* Level Cleared không được nhầm với Game Over.

# 8.7. SO SÁNH CƠ CHẾ CỦA 5 LEVEL

| Level | Tên                 | Cơ chế mới         | Thay đổi gameplay chính                                  |
| ----- | ------------------- | ------------------ | -------------------------------------------------------- |
| **1** | Time Attack         | Giới hạn thời gian | Người chơi phải vừa xóa dòng vừa duy trì thời gian       |
| **2** | Rising Garbage      | Dòng rác từ đáy    | Board liên tục bị đẩy lên nếu người chơi không xóa dòng  |
| **3** | Heavy Gravity       | Trọng lực độc lập  | Block có thể rơi riêng lẻ và tạo Chain Reaction          |
| **4** | Pentomino Expansion | Khối 5 ô           | Pool Piece và thuật toán Collision/Rotation được mở rộng |
| **5** | Target Break        | Mục tiêu cần phá   | Người chơi có mục tiêu thắng cụ thể thay vì chỉ sống sót |

Như vậy, 5 Level tạo ra **5 kiểu thay đổi logic khác nhau**:

```text
CORE TETRIS
    │
    ├── Level 1 → Thay đổi THỜI GIAN
    │
    ├── Level 2 → Thay đổi BOARD từ phía DƯỚI
    │
    ├── Level 3 → Thay đổi VẬT LÝ của BLOCK
    │
    ├── Level 4 → Thay đổi LOẠI KHỐI
    │
    └── Level 5 → Thay đổi MỤC TIÊU CHIẾN THẮNG
```

Các Level trên đáp ứng định hướng của đồ án: mỗi Level phải tạo ra một cơ chế gameplay riêng, có trigger, dữ liệu/trạng thái, phản hồi và test case; đồng thời vẫn kế thừa Core Tetris thay vì tạo thành một trò chơi hoàn toàn khác. Điều này phù hợp với yêu cầu rằng Level phải là **cơ chế mở rộng**, không chỉ là tăng tốc độ rơi.

# 9. Tiêu chí nghiệm thu cho từng Level

Mỗi Level cần đáp ứng các tiêu chí sau:

* Có tên Level và mô tả rõ mechanic mới.
* Có ít nhất một trạng thái hoặc dữ liệu mới nếu mechanic yêu cầu.
* Có luật kích hoạt và luật kết thúc rõ ràng.
* Có phản hồi để người chơi nhận biết mechanic đang hoạt động.
* Có test case cho tình huống bình thường và tình huống biên.
* Core Tetris vẫn hoạt động bình thường sau khi Level được tích hợp.
* Có thể trình diễn trong khoảng **1–2 phút** và giải thích được vì sao đây là một Level mới.

## 9.1. Mẫu đặc tả cho Level tự tạo thêm

| Trường                  | Nội dung cần điền |
| ----------------------- | ----------------- |
| **Tên Level**           | ...               |
| **Mục tiêu gameplay**   | ...               |
| **Cơ chế mới**          | ...               |
| **Điều kiện kích hoạt** | ...               |
| **Biến/trạng thái**     | ...               |
| **Input mới**           | ...               |
| **Luồng xử lý**         | ...               |
| **Ảnh hưởng tới Score** | ...               |
| **Tình huống biên**     | ...               |
| **Test case**           | ...               |
| **Tiêu chí hoàn thành** | ...               |

# 10. Cấu trúc dự án

Project được tổ chức theo hướng đơn giản để dễ phát triển và dễ debug:

```text
Tetris/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── game.js
│   ├── board.js
│   └── tetromino.js
│
├── Tetris_DacTaBaiToan_ThietKeLevel.md
│
├── README.md
│
└── .gitignore
```

### Vai trò của từng file

| File           | Vai trò                                                           |
| -------------- | ----------------------------------------------------------------- |
| `index.html`   | Chứa cấu trúc giao diện chính của trò chơi.                       |
| `style.css`    | Xử lý giao diện, bố cục, kích thước và cách hiển thị.             |
| `main.js`      | Khởi tạo game và kết nối các thành phần.                          |
| `game.js`      | Quản lý game loop, input, game state, score và luồng xử lý chính. |
| `board.js`     | Quản lý Board, collision, lock và line clear.                     |
| `tetromino.js` | Quản lý 7 Tetromino, shape, vị trí và rotation.                   |
| `README.md`    | Mô tả ngắn về dự án và hướng dẫn chạy game.                       |
| `.gitignore`   | Loại bỏ các file không cần thiết khỏi GitHub.                     |

# 11. Kết luận đặc tả

Dự án được triển khai theo hướng gồm một **Core Tetris ổn định** và một chuỗi **Level mở rộng**.

Phần Core Game tập trung vào các chức năng chính gồm Board, Tetromino, movement, rotation, collision, lock, line clear, score, Game Over, Restart và Pause.

Sau khi Core Game hoàn thành, từng Level sẽ được tích hợp thêm một cơ chế gameplay mới. Mỗi cơ chế cần có luật hoạt động, trạng thái dữ liệu, cách phản hồi cho người chơi và test case riêng.

Về mặt công nghệ, giao diện được xây dựng bằng **HTML và CSS**, trong khi **JavaScript** đảm nhiệm phần logic và xử lý trò chơi. Board và Tetromino được hiển thị bằng **Canvas** để phù hợp với việc render liên tục trong quá trình chơi.

Khi bắt đầu code thực tế, mỗi cơ chế nên được tự phân tích thành pseudocode trước, sau đó tự triển khai và kiểm thử để bảo đảm chương trình phù hợp với yêu cầu **không sử dụng AI để viết code và không sao chép code**.
