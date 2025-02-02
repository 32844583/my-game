以下是我目前的檔案架構與使用框架

🎮 前端技術
- 遊戲引擎：Phaser.js
- 物理引擎：Matter.js
- 多人同步：Socket IO.js 
- WebSocket 連線網址：wss://my-game-aapb.onrender.com
  
🖥️ 後端技術
- 後端框架：Node.js + Express
- 後端伺服器部署：Render
- API & WebSocket 伺服器網址：https://my-game-aapb.onrender.com
- 伺服器端口：process.env.PORT（Render 自動分配
```
my-game/
 ├── public/
 │    ├── index.html
 │    ├── Battle.js # 戰鬥場景設置(含socket監聽)
 │    ├── Prepare.js # 準備場景設置(含socket監聽)
 │    ├── character.js # 召喚物們的屬性、行為、狀態
 │    ├── preloadAssets # 資源的預先載入
 │    ├── NetworkManager.js # socket 連接設定
 │    ├── Game # Phaser 物件初始化
 │    ├── assets/
 │    │    ├── char/
 │    │    │    ├── mano/
 │    │    │    │    ├── base.png
 │    │    │    │    ├── atk.png
 │    │    │    │    ├── hurt.png
 │    │    │    │    ├── die.png
 │    │    │    ├── stone/
 │    │    │    │    ├── base.png
 │    │    │    │    ├── atk.png
 │    │    │    │    ├── hurt.png
 │    │    │    │    ├── die.png
 │    │    │    ├── home/
 │    │    │    │    ├── base.png
 │    │    │    │    ├── atk.png
 │    │    │    │    ├── hurt.png
 │    │    │    │    ├── die.png
 │    │    │    ├── attribute.json
 │    │    ├── audio/
 │    │    │    ├── background.mp3
 │    │    │    ├── atk.mp3
 │    │    │    ├── die.mp3
 │    │    │    ├── prepare.mp3
 │    │    ├── damage/
 │    │    │    ├── one.png
 │    │    │    ├── two.png
 │    │    │    ├── three.png
 │    │    │    ├── four.png
 │    │    │    ├── five.png
 │    │    │    ├── six.png
 │    │    │    ├── seven.png
 │    │    │    ├── eight.png
 │    │    │    ├── nine.png
 │    │    │    ├── zero.png
 │    │    ├── frame.png
 │    │    ├── background.png
 ├── server.js
 ├── package.json
 ├── node_modules/ 
```
```
// package.json
{
    "name": "my-game",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "description": "",
    "dependencies": {
    "@colyseus/schema": "^2.0.36",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "socket.io": "^4.8.1"
    }
}
```
下次目標
- 任務: 玩家已選擇區介面
在player-selections內設計六個選擇框(box)，不要使用frame.png，在這個選擇框內還有一個存放召喚物圖片的框(inner)，inner簡單的黑框就好，外面一層(box)的框為背景為深藍色，創建一個script，當使用者觸發onclick後除了執行selectMonster外，接下來還會執行你創建的script，該script將圖片存放到inner內。box要平均分配填滿pinner-selection並且之間保持一定的空隙，然後inner填滿白色並覆蓋在box上方，而box則是填滿深藍色，box比inner大一點，box的大小取決於平均分配填滿該pinner-selection跟pbox-selection，而inner的大小=box縮放70%。

- 任務: 使用game來儲存全域變數
- 任務: 死亡的特效是圖片淡出
- 任務: 在character為召喚物添加energy屬性。
