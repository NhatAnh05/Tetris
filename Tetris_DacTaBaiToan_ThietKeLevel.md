# DỰ ÁN TRÒ CHƠI TETRIS

## Đặc tả bài toán và thiết kế Level

**Nội dung:** Mô tả luật chơi, yêu cầu chức năng và cơ chế mở rộng theo Level.

# MỤC LỤC

1. Phát biểu bài toán
2. Mục tiêu và phạm vi

   * 2.1. Mục tiêu
   * 2.2. Phạm vi Core Game
3. Khái niệm và trạng thái của trò chơi

   * 3.1. Các thực thể chính
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
10. Kết luận đặc tả

# 1. Phát biểu bài toán

Xây dựng một trò chơi Tetris trong đó người chơi điều khiển các Tetromino rơi xuống một bàn chơi dạng lưới. Người chơi có thể di chuyển và xoay các khối để lấp đầy các hàng.

Khi một hàng được lấp đầy, hàng đó sẽ được xóa, người chơi nhận điểm và các khối phía trên được dịch xuống. Trò chơi kết thúc khi một Tetromino mới không thể xuất hiện tại vị trí khởi tạo.

Sau khi hoàn thiện phần **Core Game**, hệ thống sẽ được mở rộng theo từng **Level**. Mỗi Level bổ sung ít nhất một cơ chế gameplay mới, thay vì chỉ đơn giản là tăng tốc độ rơi của Tetromino.

# 2. Mục tiêu và phạm vi

## 2.1. Mục tiêu

Dự án hướng đến các mục tiêu sau:

* Xây dựng một trò chơi Tetris cơ bản hoạt động ổn định.
* Thiết kế hệ thống dữ liệu đơn giản, dễ tự code và dễ debug.
* Mở rộng trò chơi thành ít nhất **5 Level**, trong đó mỗi Level có thêm một cơ chế mới.
* Mỗi Level có luật riêng, trạng thái riêng nếu cần và test case riêng.
* Không dựa vào source code do AI tạo ra hoặc sao chép nguyên source code để hoàn thành bài.

## 2.2. Phạm vi Core Game

| Thành phần     | Mô tả                                                            |
| -------------- | ---------------------------------------------------------------- |
| **Board**      | Lưới chứa các ô trống và các block đã khóa.                      |
| **Tetromino**  | Một trong 7 khối chuẩn: I, O, T, S, Z, J, L.                     |
| **Input**      | Nhận thao tác trái, phải, xuống, xoay và các phím Level nếu có.  |
| **Collision**  | Kiểm tra biên board và các block đã tồn tại.                     |
| **Lock**       | Chuyển Tetromino từ trạng thái đang rơi sang trạng thái cố định. |
| **Line Clear** | Phát hiện hàng đầy, xóa hàng và dồn dữ liệu phía trên xuống.     |
| **Score**      | Tính điểm theo số dòng và các cơ chế thưởng đã được đặc tả.      |
| **Game State** | Quản lý các trạng thái Playing, Paused, Game Over và Restart.    |

# 3. Khái niệm và trạng thái của trò chơi

## 3.1. Các thực thể chính

| Thực thể       | Thuộc tính gợi ý                      | Vai trò                                       |
| -------------- | ------------------------------------- | --------------------------------------------- |
| **Board**      | `width`, `height`, `cells`            | Lưu trạng thái của lưới.                      |
| **Tetromino**  | `type`, `x`, `y`, `rotation`, `shape` | Đại diện cho khối đang được điều khiển.       |
| **GameState**  | `state`, `score`, `lines`             | Theo dõi trạng thái của phiên chơi.           |
| **LevelState** | `currentLevel`, `unlocked`            | Theo dõi Level hiện tại và các feature đã mở. |
| **NextPiece**  | `nextPiece`                           | Lưu khối tiếp theo từ Level 1 trở lên.        |
| **HoldPiece**  | `holdPiece`, `canHold`                | Quản lý cơ chế Hold từ Level 2.               |
| **Combo**      | `combo`, `lastClearAction`            | Theo dõi chuỗi clear từ Level 4.              |
| **Bomb**       | `position`, `effectArea`              | Đại diện cho block đặc biệt ở Level 5.        |

## 3.2. Trạng thái game

Luồng trạng thái chính của trò chơi:

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

# 4. Yêu cầu chức năng của Core Tetris

| Mã        | Chức năng           | Yêu cầu                                                                               |
| --------- | ------------------- | ------------------------------------------------------------------------------------- |
| **FR-01** | Khởi tạo board      | Tạo bàn chơi đúng kích thước và trạng thái rỗng.                                      |
| **FR-02** | Sinh Tetromino      | Sinh một trong bảy Tetromino và đặt tại vị trí khởi tạo.                              |
| **FR-03** | Di chuyển trái/phải | Chỉ cập nhật vị trí nếu vị trí mới hợp lệ.                                            |
| **FR-04** | Rơi xuống           | Tetromino có thể rơi tự động và người chơi có thể yêu cầu rơi nhanh.                  |
| **FR-05** | Xoay                | Xoay Tetromino theo luật đã xác định và từ chối thao tác nếu vị trí mới không hợp lệ. |
| **FR-06** | Collision           | Phát hiện va chạm với biên board và block cố định.                                    |
| **FR-07** | Lock                | Khi không thể rơi tiếp, khối được khóa vào board.                                     |
| **FR-08** | Line Clear          | Xóa mọi hàng đã đầy và dồn phần trên xuống.                                           |
| **FR-09** | Score               | Cập nhật score sau khi clear theo công thức quy định.                                 |
| **FR-10** | Game Over           | Khi vị trí spawn không hợp lệ, chuyển trạng thái sang Game Over.                      |
| **FR-11** | Restart             | Xóa phiên hiện tại và khởi tạo một phiên chơi mới.                                    |
| **FR-12** | Pause               | Tạm dừng input/game loop nếu tính năng này được đưa vào scope.                        |

# 5. Luật xử lý game

## 5.1. Luật sinh và điều khiển Tetromino

* Mỗi lượt có một Tetromino hiện tại.
* Tetromino chỉ được thay đổi vị trí nếu trạng thái mới hợp lệ.
* Rotation được coi là một thao tác tạo ra trạng thái vị trí mới. Nếu trạng thái mới không hợp lệ thì không áp dụng rotation.
* Khi Tetromino không thể di chuyển xuống nữa, nó sẽ được lock vào board.

## 5.2. Luật Line Clear

Sau khi Tetromino được lock, hệ thống thực hiện các bước:

1. Duyệt các hàng từ dưới lên.
2. Kiểm tra hàng đã đủ ô hay chưa.
3. Nếu hàng đầy thì đánh dấu để xóa.
4. Loại bỏ các hàng đã đầy.
5. Dồn các hàng phía trên xuống.
6. Cập nhật số dòng đã xóa.
7. Tính score dựa trên số dòng và mechanic hiện hành.

## 5.3. Luật Game Over

Một phiên chơi chuyển sang **Game Over** khi Tetromino mới không thể đặt tại vị trí spawn vì đã va chạm với dữ liệu hiện có trên board.

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

# 7. Thiết kế hệ thống Level

Level được mở theo tiến trình của sản phẩm/gameplay. Việc tăng Level không bắt buộc phải gắn với việc tăng tốc độ rơi.

Một Level được xem là hợp lệ khi có đầy đủ:

1. **Cơ chế mới**.
2. **Luật kích hoạt**.
3. **Dữ liệu hoặc trạng thái cần thiết**.
4. **Cách hiển thị hoặc phản hồi cho người chơi**.
5. **Test case** để kiểm tra cơ chế.

Trước khi bắt đầu code một Level, cần trả lời các câu hỏi sau:

| Tiêu chí       | Câu hỏi cần trả lời                                            |
| -------------- | -------------------------------------------------------------- |
| **Tên**        | Level này gọi là gì?                                           |
| **Cơ chế mới** | Khác Core Game ở điểm nào?                                     |
| **Điều kiện**  | Khi nào cơ chế được kích hoạt?                                 |
| **Input**      | Người chơi có thao tác mới không?                              |
| **State**      | Cần thêm biến hoặc trạng thái nào?                             |
| **Tác động**   | Cơ chế làm thay đổi gameplay hoặc quyết định chơi như thế nào? |
| **Kết thúc**   | Khi nào mechanic không còn hiệu lực?                           |
| **Test**       | Có thể chứng minh cơ chế hoạt động đúng bằng tình huống nào?   |

# 8. Đặc tả chi tiết Level 1–5

## Level 1 – Next Piece

### Mô tả

Bổ sung khả năng xem trước Tetromino tiếp theo để người chơi có thể chuẩn bị vị trí đặt khối.

| Mục                | Đặc tả                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trạng thái mới** | `nextPiece`                                                                                                                                                                                          |
| **Luật chính**     | Khi khởi tạo game, tạo `currentPiece` và `nextPiece`. Sau khi `currentPiece` được lock, `nextPiece` trở thành `currentPiece`. Sau đó tạo một `nextPiece` mới để duy trì hàng đợi tối thiểu một khối. |
| **Luồng xử lý**    | Spawn current + next → Player plays current → Lock current → next → current → Generate new next                                                                                                      |
| **Test trọng tâm** | Next phải luôn có giá trị sau khi game bắt đầu. Sau mỗi lần lock, current mới phải đúng bằng next cũ. Restart phải xóa trạng thái Next cũ.                                                           |

## Level 2 – Hold Piece

### Mô tả

Cho phép người chơi cất Tetromino hiện tại để sử dụng ở lượt khác, từ đó tạo thêm chiến thuật quản lý khối.

| Mục                | Đặc tả                                                                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trạng thái mới** | `holdPiece`, `canHold`                                                                                                                                                                                                                                                                           |
| **Luật chính**     | Nếu `holdPiece` rỗng, `currentPiece` được đưa vào Hold và một piece mới được lấy ra chơi. Nếu `holdPiece` đã có, `currentPiece` và `holdPiece` được đổi chỗ. Trong một lượt Tetromino, `canHold` chỉ cho phép thao tác một lần. Sau khi lock và chuyển sang khối mới, reset `canHold` theo luật. |
| **Luồng xử lý**    | Current piece → Press Hold → Check `canHold` → Store / Swap → Set `canHold = false` → Lock piece → New piece → Set `canHold = true`                                                                                                                                                              |
| **Test trọng tâm** | Hold khi ô Hold rỗng. Hold khi đã có khối. Nhấn Hold lần thứ hai trong cùng lượt không được đổi khối. Restart phải làm sạch Hold.                                                                                                                                                                |

## Level 3 – Ghost Piece

### Mô tả

Hiển thị vị trí cuối cùng hợp lệ mà Tetromino hiện tại sẽ rơi xuống, giúp người chơi dễ căn chỉnh vị trí trước khi khóa khối.

| Mục                | Đặc tả                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trạng thái mới** | `ghostY`                                                                                                                                         |
| **Luật chính**     | Ghost không ghi vào board. Ghost sử dụng cùng luật collision với currentPiece. Mỗi khi currentPiece di chuyển hoặc xoay, `ghostY` được tính lại. |
| **Luồng xử lý**    | Read current x/y/rotation → Copy virtual position → Move virtual piece downward until invalid → Step back one position → Render ghost            |
| **Test trọng tâm** | Ghost không nằm ngoài board. Ghost cập nhật sau thao tác trái/phải/xoay. Ghost biến mất hoặc ngừng vẽ khi không còn currentPiece.                |

## Level 4 – Combo

### Mô tả

Thêm cơ chế thưởng điểm khi người chơi xóa dòng liên tiếp theo một chuỗi hành động hợp lệ.

| Mục                | Đặc tả                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trạng thái mới** | `combo`, `lastClearAction`                                                                                                                                          |
| **Luật chính**     | Xóa dòng theo điều kiện combo làm combo tăng. Một lượt không thỏa điều kiện combo sẽ reset combo theo luật được chọn. Bonus combo phải được tách khỏi score cơ bản. |
| **Luồng xử lý**    | Clear lines? → Yes → Check combo condition → Increase combo → Calculate base + bonus → No → Reset combo                                                             |
| **Test trọng tâm** | Combo 1, 2, 3 tăng đúng. Một lượt không clear reset combo theo luật. Restart reset combo. Điểm cơ bản không bị cộng trùng.                                          |

## Level 5 – Bomb Block

### Mô tả

Thêm một loại block đặc biệt có khả năng phá một vùng nhỏ của board khi được kích hoạt.

| Mục                | Đặc tả                                                                                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trạng thái mới** | `bomb type/status`, `effectArea`                                                                                                                                                                                                                                            |
| **Luật chính**     | Bomb phải có điều kiện xuất hiện rõ ràng. Khi Bomb được kích hoạt, chỉ các ô nằm trong vùng ảnh hưởng được xóa hoặc chuyển trạng thái. Tọa độ vùng ảnh hưởng phải được giới hạn trong board. Sau hiệu ứng, board phải trở về trạng thái nhất quán trước khi sinh piece mới. |
| **Luồng xử lý**    | Spawn / create bomb → Lock or trigger → Determine effect area → Clamp to board → Clear affected cells → Update score if applicable → Continue game                                                                                                                          |
| **Test trọng tâm** | Bomb ở giữa board. Bomb sát biên. Bomb ở góc. Bomb không xóa nhầm ô ngoài vùng. Sau Bomb, line clear và collision vẫn hoạt động.                                                                                                                                            |

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

Khi tự thiết kế thêm Level, có thể sử dụng mẫu sau:

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

# 10. Kết luận đặc tả

Dự án nên được triển khai theo hướng gồm một **Core Tetris ổn định** và một chuỗi **Level mở rộng**.

Mỗi Level không chỉ thay đổi tốc độ chơi mà cần bổ sung một cơ chế gameplay mới, có luật hoạt động, trạng thái dữ liệu, cách phản hồi cho người chơi và test case riêng.

Khi bắt đầu code thực tế, mỗi cơ chế nên được tự phân tích thành pseudocode trước. Sau đó tự triển khai và kiểm thử để bảo đảm chương trình phù hợp với yêu cầu **không sử dụng AI để viết code và không sao chép code**.
