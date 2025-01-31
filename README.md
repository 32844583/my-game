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
 │    ├── game.js # 建立並啟動 Phaser 遊戲
 │    ├── battleScene.js # 戰鬥場景設置
 │    ├── networking.js # 玩家準備室以及socket設置處
 │    ├── character.js # 召喚物控制
 │    ├── assets/
 │    │    ├── char/
 │    │    │    ├── mano/
 │    │    │    │    ├── base.png
 │    │    │    │    ├── atk.png
 │    │    │    │    ├── hurt.png
 │    │    │    │    ├── die.png
 ├── server.js
 ├── package.json
 ├── node_modules/  (如果有安裝 npm 模組)
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
