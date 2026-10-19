# ĐẶC TẢ TRÒ CHƠI TETRIS WEB

## 1. Thông tin dự án

- **Tên dự án:** Tetris Web Game
- **Nền tảng:** Trình duyệt web
- **Công nghệ:** HTML5, CSS/SCSS, JavaScript và Canvas
- **Môi trường phát triển:** IntelliJ IDEA
- **Quản lý mã nguồn:** Git và GitHub

## 2. Mục tiêu trò chơi

Xây dựng trò chơi Tetris chạy trên trình duyệt. Người chơi điều khiển các khối Tetromino rơi từ trên xuống, sắp xếp chúng để lấp kín hàng ngang. Mỗi hàng được lấp đầy sẽ bị xóa và người chơi nhận điểm.

Ngoài chế độ Tetris cơ bản, trò chơi có các Level với luật chơi riêng. Các Level bổ sung thử thách bằng cách thay đổi Board, hạn chế vị trí di chuyển hoặc tác động đến Tetromino đang được điều khiển.

## 3. Thành phần chính

| Thành phần | Chức năng |
|---|---|
| Board | Lưới chơi gồm 10 cột và 20 hàng, lưu trạng thái các ô đã chiếm. |
| Tetromino | Bảy dạng khối tiêu chuẩn: I, O, T, S, Z, J và L. |
| Movement | Di chuyển khối sang trái, sang phải và xuống dưới. |
| Rotation | Xoay khối nếu vị trí sau khi xoay hợp lệ. |
| Collision | Kiểm tra va chạm với biên Board, các khối đã khóa và chướng ngại vật của Level. |
| Lock | Cố định khối vào Board khi không thể rơi xuống thêm. |
| Line Clear | Xóa những hàng đã được lấp đầy. |
| Score và Lines | Theo dõi điểm và tổng số hàng đã xóa. |
| Next Piece | Hiển thị khối sắp xuất hiện. |
| Hold Piece | Lưu khối hiện tại để đổi với khối khác. |
| Ghost Piece | Hiển thị vị trí dự kiến khối sẽ chạm nếu rơi thẳng xuống. |
| Level System | Theo dõi luật chơi, tiến trình và điều kiện hoàn thành Level. |
| Canvas Renderer | Vẽ Board, Tetromino, Ghost Piece và các lớp thông báo. |

## 4. Luật chơi cơ bản

### 4.1. Vòng đời của một khối

1. Hệ thống tạo khối mới tại vị trí xuất hiện.
2. Người chơi di chuyển hoặc xoay khối.
3. Khối tự động rơi theo thời gian; người chơi cũng có thể yêu cầu rơi nhanh hoặc thả khối xuống.
4. Khi khối không thể rơi tiếp, khối được khóa vào Board.
5. Hệ thống kiểm tra và xóa các hàng đã đầy.
6. Điểm và tổng số hàng được cập nhật.
7. Khối tiếp theo xuất hiện và vòng chơi tiếp tục.

Khối chỉ được di chuyển hoặc xoay khi vị trí mới hợp lệ. Trò chơi chuyển sang **GAME OVER** nếu khối tiếp theo không thể xuất hiện tại vị trí bắt đầu.

### 4.2. Tính điểm

| Số hàng được xóa trong một lần | Điểm nhận được |
|---:|---:|
| 1 | 100 |
| 2 | 300 |
| 3 | 500 |
| 4 | 800 |

Bảng điểm được cập nhật sau mỗi lần xóa hàng. Bộ đếm Lines thể hiện tổng số hàng đã xóa trong ván hiện tại.

### 4.3. Chức năng hỗ trợ

- **Next Piece:** Cho biết khối tiếp theo để người chơi chuẩn bị.
- **Hold Piece:** Cho phép cất khối hiện tại và đổi lại sau đó. Mỗi khối chỉ được Hold một lần trước khi khóa.
- **Ghost Piece:** Hiển thị vị trí mà khối hiện tại sẽ chạm nếu rơi thẳng xuống.

Next, Hold và Ghost là chức năng của Core Game, không phải Level độc lập.

## 5. Điều khiển

| Phím | Chức năng |
|---|---|
| `←` | Di chuyển sang trái. |
| `→` | Di chuyển sang phải. |
| `↓` | Cho khối rơi nhanh hơn một bước. |
| `↑` | Xoay khối. |
| `Space` | Thả khối xuống vị trí thấp nhất hợp lệ. |
| `C` | Hold hoặc đổi khối. |
| `P` | Tạm dừng hoặc tiếp tục. |
| `R` | Chơi lại. |

Các nút **Start**, **Pause** và **Restart** cũng được cung cấp trên giao diện.

## 6. Trạng thái trò chơi

| Trạng thái | Mô tả |
|---|---|
| `START` | Chờ người chơi bắt đầu. |
| `COUNTDOWN` | Đếm ngược 3, 2, 1 trước khi chơi. |
| `PLAYING` | Trò chơi đang diễn ra. |
| `PAUSED` | Tạm dừng; khối và bộ đếm thời gian của cơ chế Level không tiếp tục cập nhật. |
| `GAME_OVER` | Không thể tạo khối mới tại vị trí bắt đầu. |
| `LEVEL_COMPLETE` | Người chơi đã hoàn thành mục tiêu của Level hiện tại. |

Khi bắt đầu hoặc chơi lại, Board, điểm, số hàng và tiến trình Level được đặt lại. Khi tạm dừng, các cơ chế theo thời gian như Bomb hoặc gió không được tiếp tục đếm.

## 7. Bố cục giao diện

Giao diện có ba khu vực:

- **Bên trái:** Bộ chọn Level, mô tả mục tiêu, Score, Lines, Hold Piece và thông báo trạng thái.
- **Ở giữa:** Board chơi chính, được vẽ bằng Canvas.
- **Bên phải:** Next Piece, các nút Start/Pause/Restart, hướng dẫn điều khiển và tiến trình của Level.

Khi đếm ngược, tạm dừng, thua hoặc hoàn thành Level, thông báo được hiển thị trên Board hoặc ở khu vực thông báo.

## 8. Nguyên tắc thiết kế Level

Mỗi Level cần có cơ chế riêng, điều kiện kích hoạt và cách xử lý rõ ràng. Cơ chế mới phải tác động đến Board, vị trí của Tetromino, cách di chuyển hoặc mục tiêu người chơi; chỉ thay đổi màu sắc hoặc điểm số không được xem là một Level mới.

Mỗi cơ chế Level cần được kiểm thử với các tình huống bình thường, gần biên Board, va chạm và khởi động lại.

## 9. Level 0 – Core Tetris

### Cách chơi

Người chơi xếp các Tetromino để lấp đầy hàng ngang. Mỗi hàng đầy được xóa và hệ thống cộng điểm theo bảng tính điểm ở mục 4.1.

### Điều kiện kết thúc

- **Thắng theo mục tiêu:** Không có điều kiện thắng bắt buộc; người chơi cố gắng đạt điểm cao.
- **Thua:** Khối mới không thể xuất hiện tại vị trí bắt đầu.

### Kiểm thử

- Bảy loại Tetromino có thể xuất hiện.
- Di chuyển, xoay, rơi, thả nhanh và khóa khối hoạt động đúng.
- Hàng đầy được xóa và các hàng phía trên được cập nhật.
- Điểm được tính đúng khi xóa 1, 2, 3 hoặc 4 hàng.
- Game Over xảy ra khi không còn vị trí xuất hiện khối mới.

## 10. Level 1 – Garbage Row

### Mục tiêu

Thử thách người chơi bằng các hàng rác được thêm vào Board trong quá trình chơi.

### Cơ chế và luật xử lý

- Sau mỗi **4 Tetromino được khóa**, hệ thống thêm một Garbage Row ở đáy Board.
- Garbage Row có ít nhất một ô trống.
- Khi thêm hàng, các hàng hiện có được đẩy lên.
- Garbage Row được xử lý như các ô đã chiếm chỗ và có thể bị xóa khi hàng đầy.
- Nếu thêm hàng làm vùng trên cùng bị chiếm dẫn đến không thể tiếp tục, trò chơi chuyển sang Game Over.

### Điều kiện hoàn thành

Xóa được **3 Garbage Row**.

### Trạng thái cần theo dõi

`piecesSinceGarbage`, `garbageRowsCreated`, `garbageRowsCleared`.

### Kiểm thử

- Hàng rác xuất hiện sau mỗi 4 lần khóa khối.
- Hàng rác luôn có ít nhất một ô trống.
- Hàng rác có thể được xóa như hàng bình thường.
- Chưa đủ 4 lần khóa thì không thêm hàng rác.
- Xóa đủ 3 hàng rác thì Level hoàn thành.

## 11. Level 2 – Bomb Attack

### Mục tiêu

Thêm một sự kiện tự phát nổ, làm thay đổi cấu trúc Board và tạo áp lực cho người chơi.

### Cơ chế và luật xử lý

- Sau mỗi **5 Tetromino được khóa**, hệ thống tạo Bomb nếu không có Bomb nào đang hoạt động.
- Bomb được đặt tại một ô trong Board, ưu tiên các vị trí có nhiều khối xung quanh.
- Bomb tự phát nổ sau khoảng **4,2 giây**; người chơi không cần nhấn nút kích nổ.
- Khi nổ, Bomb xóa các khối đã khóa trong vùng **3 × 3** quanh vị trí Bomb.
- Sau vụ nổ, những khối còn lại được dồn xuống theo từng cột để xử lý khoảng trống.
- Board sau đó được thêm một Garbage Row ở đáy. Nếu hàng mới khiến vùng trên cùng bị chiếm hoặc khối hiện tại va chạm, trò chơi kết thúc.
- Sau vụ nổ, hệ thống kiểm tra lại các hàng đầy và cập nhật điểm nếu có.

### Mục tiêu chơi

Chế độ hiện tại là **sinh tồn đến khi Game Over**. Số Bomb đã tạo và đã nổ được hiển thị để theo dõi tiến trình.

### Trạng thái cần theo dõi

`piecesSinceBomb`, `bombPosition`, `bombActive`, `bombFuseRemaining`, `bombsCreated`, `bombsUsed`.

### Kiểm thử

- Bomb chỉ xuất hiện khi đủ 5 lần khóa khối và không có Bomb đang hoạt động.
- Bomb tự nổ khi hết thời gian chờ.
- Vùng nổ không vượt ra ngoài Board.
- Bomb hoạt động đúng khi nằm giữa, sát biên hoặc gần góc.
- Khối đang được điều khiển không bị xóa trực tiếp bởi vụ nổ.
- Các khối còn lại được dồn xuống và hàng rác được thêm sau vụ nổ.
- Pause và Restart xử lý bộ đếm Bomb đúng.

## 12. Level 3 – Blocked Column

### Mục tiêu

Buộc người chơi thay đổi cách di chuyển và đặt khối khi một cột bị hạn chế tạm thời.

### Cơ chế và luật xử lý

- Sau mỗi **6 Tetromino được khóa**, hệ thống chọn một cột trong nhóm cột gần hai bên Board để khóa.
- Cột bị khóa tồn tại trong **3 lượt Tetromino tiếp theo**.
- Tetromino không thể chiếm các ô trong cột đang bị khóa.
- Lệnh di chuyển hoặc xoay tạo ra vị trí vi phạm sẽ bị từ chối.
- Khi hết thời hạn, cột được mở lại và hệ thống tiếp tục đếm cho đợt tiếp theo.

### Mục tiêu chơi

Chế độ hiện tại là **sinh tồn đến khi Game Over**. Giao diện hiển thị cột bị khóa và số lượt còn lại.

### Trạng thái cần theo dõi

`piecesSinceBlocked`, `blockedColumn`, `blockedTurns`, `blockedCount`.

### Kiểm thử

- Cột được khóa sau 6 lần khóa khối.
- Khối không thể di chuyển hoặc xoay vào cột bị khóa.
- Cột được mở lại sau thời hạn quy định.
- Cơ chế khóa cột không vô hiệu hóa các kiểm tra va chạm ở biên Board.
- Restart xóa trạng thái cột bị khóa và đặt lại bộ đếm.

## 13. Level 4 – Wind Gust

### Mục tiêu

Tạo một thử thách điều khiển khối bằng các đợt gió tự động đẩy Tetromino sang trái hoặc phải.

### Cơ chế và luật xử lý

- Sau mỗi **5 Tetromino được khóa**, hệ thống bắt đầu một đợt gió nếu hiện không có đợt gió nào hoạt động.
- Mỗi đợt gió kéo dài **5 giây**.
- Khi bắt đầu đợt gió, hệ thống chọn ngẫu nhiên hướng sang trái hoặc sang phải.
- Trong thời gian gió, cứ mỗi **800 mili giây**, gió thử đẩy Tetromino hiện tại một ô theo hướng đã chọn.
- Trước khi dịch chuyển, hệ thống kiểm tra va chạm với biên Board và các khối đã khóa. Nếu vị trí mới không hợp lệ, khối giữ nguyên vị trí.
- Hết 5 giây, đợt gió kết thúc. Nếu đã đủ 5 lần khóa khối cho đợt kế tiếp trong lúc gió đang hoạt động, hệ thống sẽ bắt đầu đợt mới sau khi đợt hiện tại kết thúc.
- Bộ đếm gió chỉ cập nhật khi trò chơi ở trạng thái `PLAYING`, vì vậy Pause sẽ tạm dừng hiệu ứng gió.

### Điều kiện hoàn thành

Xóa được ít nhất **8 hàng** trong Level 4. Khi đạt mục tiêu, trò chơi chuyển sang `LEVEL_COMPLETE` và dừng điều khiển khối hiện tại.

### Trạng thái cần theo dõi

`piecesSinceWind`, `windActive`, `windRemaining`, `windPushRemaining`, `windDuration`, `windPushInterval`, `windDirection`, `targetWindLines`.

### Kiểm thử

- Gió bắt đầu sau mỗi 5 lần khóa khối khi không có đợt gió đang chạy.
- Hướng gió được chọn khi bắt đầu một đợt.
- Đợt gió kéo dài 5 giây và đẩy khối theo chu kỳ 800 mili giây.
- Nếu vị trí mới va chạm, khối không bị đẩy xuyên qua vật cản.
- Không có hai đợt gió được kích hoạt đồng thời.
- Khi Pause, thời gian gió không tiếp tục giảm.
- Khi Restart, trạng thái gió và các bộ đếm được đặt lại.
- Xóa đủ 8 hàng sẽ hoàn thành Level và không tiếp tục điều khiển khối.

## 14. Level 5 – Reverse Controls

### Mục tiêu

Thử thách khả năng điều khiển của người chơi bằng cách đảo chiều di chuyển ngang trong một khoảng thời gian nhất định. Khi hiệu ứng hoạt động, lệnh di chuyển sang trái sẽ khiến Tetromino dịch sang phải và ngược lại.

### Cơ chế và luật xử lý

- Khi đang chơi Level 5 và hiệu ứng đảo điều khiển chưa hoạt động, sau mỗi **6 Tetromino được khóa**, hệ thống kích hoạt một đợt đảo điều khiển.
- Mỗi đợt kéo dài **5 giây**.
- Trong thời gian hiệu ứng, mọi thao tác di chuyển ngang phải được đảo chiều thống nhất, dù thao tác được gọi từ bàn phím hay nút trên giao diện.
- Chỉ đảo chiều di chuyển trái/phải. Xoay khối, rơi xuống, Hard Drop và Hold giữ nguyên chức năng.
- Việc đảo chiều không được bỏ qua kiểm tra va chạm. Nếu vị trí mới không hợp lệ, Tetromino không di chuyển.
- Không kích hoạt chồng hai đợt. Bộ đếm thời gian chỉ cập nhật khi trạng thái game là `PLAYING`; khi Pause, hiệu ứng không giảm thời gian.
- Khi hết 5 giây, hiệu ứng kết thúc và ghi nhận một đợt đã vượt qua. Hệ thống tiếp tục đếm số khối được khóa cho đợt sau.
- Nếu người chơi bị `GAME_OVER` trước khi một đợt kết thúc, đợt đó không được tính là đã vượt qua.

### Điều kiện hoàn thành

Vượt qua **3 đợt đảo điều khiển**. Một đợt chỉ được tính khi thời gian 5 giây kết thúc tự nhiên trong lúc trò chơi vẫn đang diễn ra. Khi hoàn thành mục tiêu, chuyển trạng thái sang `LEVEL_COMPLETE` và dừng khối hiện tại.

### Trạng thái cần theo dõi

`piecesSinceReverse`, `reverseActive`, `reverseRemaining`, `reverseDuration`, `reverseRoundsCompleted`, `targetReverseRounds`.

### Kiểm thử

- Level 5 có thể được chọn từ giao diện.
- Đợt đảo điều khiển bắt đầu khi đủ 6 khối được khóa và chưa có hiệu ứng nào hoạt động.
- Hiệu ứng kéo dài 5 giây và không bị kích hoạt chồng lên nhau.
- Khi hiệu ứng hoạt động, trái thành phải và phải thành trái; khi kết thúc, cách điều khiển trở lại bình thường.
- Xoay, rơi xuống, Hard Drop và Hold không bị đảo chiều.
- Kiểm tra va chạm vẫn hoạt động khi điều khiển đã đảo chiều.
- Pause không làm thời gian hiệu ứng tiếp tục giảm; Restart đặt lại toàn bộ trạng thái Level 5.
- Đợt chỉ được tính khi kết thúc tự nhiên; Game Over không được tính là vượt qua đợt.
- Vượt qua 3 đợt sẽ chuyển sang `LEVEL_COMPLETE`.

## 15. Xử lý lỗi và trường hợp biên

- Không cho phép Tetromino đi ra ngoài biên Board.
- Không cho phép các khối chồng lên ô đã bị chiếm.
- Không cho phép di chuyển hoặc xoay nếu vị trí mới không hợp lệ.
- Không cập nhật gameplay khi ở trạng thái `START`, `PAUSED`, `GAME_OVER` hoặc `LEVEL_COMPLETE`, ngoại trừ phần hiển thị.
- Restart phải đặt lại Board, điểm, số hàng, khối đang giữ và mọi tiến trình Level.
- Các cơ chế theo thời gian phải dừng khi tạm dừng và được khởi tạo lại khi bắt đầu ván mới.
- Cơ chế Level phải tương thích với Collision, Lock, Line Clear và Game Over.

## 16. Tiêu chí hoàn thành dự án

- Core Game hoạt động với đủ bảy loại Tetromino.
- Movement, Rotation, Gravity, Collision, Lock và Line Clear hoạt động đúng.
- Score, Lines, Next Piece, Hold Piece và Ghost Piece hoạt động đúng.
- Các trạng thái Start, Countdown, Playing, Paused, Game Over và Level Complete được xử lý đúng.
- Giao diện có bộ chọn Level, Board, thông tin điểm và số dòng, khối Next/Hold và các nút điều khiển.
- Level 1 thêm Garbage Row và có điều kiện hoàn thành.
- Level 2 có Bomb tự phát nổ và xử lý thay đổi Board.
- Level 3 có cột bị khóa tạm thời.
- Level 4 có gió đẩy khối và điều kiện hoàn thành 8 dòng.
- Level 5 đảo điều khiển trong thời gian giới hạn và hoàn thành sau 3 đợt.
- Restart đưa game và tiến trình của Level về trạng thái ban đầu.
- Các test case quan trọng ở từng Level được kiểm tra trước khi nộp.

## 17. Sơ đồ thành phần

```text
TETRIS WEB GAME
|
|-- CORE GAME
|   |-- Board 10 x 20
|   |-- 7 loại Tetromino
|   |-- Movement và Rotation
|   |-- Collision và Lock
|   |-- Gravity và Line Clear
|   |-- Score và Lines
|   |-- Next, Hold và Ghost
|   `-- Game State
|
|-- USER INTERFACE
|   |-- Bộ chọn Level và mục tiêu
|   |-- Board Canvas
|   |-- Score / Lines / Next / Hold
|   |-- Nút Start / Pause / Restart
|   `-- Thông báo trạng thái và tiến trình
|
`-- LEVEL SYSTEM
    |-- Level 1: Garbage Row
    |-- Level 2: Bomb Attack
    |-- Level 3: Blocked Column
    |-- Level 4: Wind Gust
    `-- Level 5: Reverse Controls
```
