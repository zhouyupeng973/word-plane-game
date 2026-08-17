// 游戏主入口 - 抖音小游戏
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js';
import { Keyboard } from './keyboard.js';
import { InputManager } from './input.js';
import { UI } from './ui.js';
import { setLevel, markWordDestroyed, resetDestroyedWords } from './words.js';
import { setupSounds, soundManager } from './audio.js';

// 创建画布
const canvas = typeof tt !== 'undefined' ? tt.createCanvas() : document.createElement('canvas');
if (typeof tt !== 'undefined') {
  const info = tt.getSystemInfoSync();
  canvas.width = info.windowWidth;
  canvas.height = info.windowHeight;
} else {
  canvas.width = 375;
  canvas.height = 667;
  document.body.appendChild(canvas);
  document.body.style.margin = '0';
  document.body.style.display = 'flex';
  document.body.style.justifyContent = 'center';
  document.body.style.alignItems = 'center';
  document.body.style.height = '100vh';
  document.body.style.background = '#222';
  canvas.style.border = '2px solid #444';
}

const ctx = canvas.getContext('2d');

// 初始化游戏组件
const keyboard = new Keyboard(canvas);
const player = new Player(canvas, keyboard);
const input = new InputManager();
const ui = new UI(canvas);

// 初始化音效
setupSounds();

// 游戏对象列表
let enemies = [];
let bullets = [];
let particles = [];

// 游戏状态
let enemySpawnTimer = 0;
let enemySpawnInterval = 90; // 帧数
let difficulty = 1;
let frameCount = 0;
let prevBgmState = false; // 上一帧是否在播放状态（用于BGM控制）

// 粒子效果
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;
    this.life = 25;
    this.maxLife = 25;
    this.color = color;
    this.r = Math.random() * 3 + 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    this.life--;
  }
  draw(ctx) {
    const a = this.life / this.maxLife;
    ctx.fillStyle = this.color.replace(')', ',' + a + ')').replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createExplosion(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// 敌机爆炸：粒子+单词朗读（TTS失败时回退爆炸音）+标记单词已击毁
function enemyDestroy(enemy) {
  enemy.destroyed = true;
  createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'rgb(239, 83, 80)');
  soundManager.speakWord(enemy.fullWord);
  markWordDestroyed(enemy.fullWord); // 本局不再出现该单词
}

// 背景星星
const bgStars = [];
for (let i = 0; i < 80; i++) {
  bgStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: Math.random() * 1.5 + 0.5,
    r: Math.random() * 1.5 + 0.3
  });
}

function drawBackground() {
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0D1B2A');
  gradient.addColorStop(0.5, '#1B263B');
  gradient.addColorStop(1, '#415A77');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 星星
  ctx.fillStyle = '#FFFFFF';
  for (const s of bgStars) {
    ctx.globalAlpha = 0.3 + Math.sin(frameCount * 0.05 + s.x) * 0.2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    if (ui.state === 'playing') {
      s.y += s.speed;
      if (s.y > canvas.height) {
        s.y = 0;
        s.x = Math.random() * canvas.width;
      }
    }
  }
  ctx.globalAlpha = 1;
}

// 生成敌机
function spawnEnemy() {
  enemies.push(new Enemy(canvas, difficulty));
}

// 键盘按键处理
keyboard.onKeyPress = (letter) => {
  if (ui.state !== 'playing') return; // 暂停/结束时不发射

  // 找到屏幕上最低（最接近玩家）且字母匹配的敌机
  let targetEnemy = null;
  let lowestY = -Infinity;
  
  for (const enemy of enemies) {
    if (enemy.destroyed) continue;
    if (enemy.checkLetterMatch(letter)) {
      if (enemy.y > lowestY) {
        lowestY = enemy.y;
        targetEnemy = enemy;
      }
    }
  }

  // 发射子弹
  const bullet = new Bullet(player.getBulletX(), player.getBulletY(), letter);
  bullet.target = targetEnemy; // 标记目标敌机
  bullets.push(bullet);
};

// 重置游戏对象（开始/重新开始时调用）
function resetGameObjects() {
  enemies = [];
  bullets = [];
  particles = [];
  frameCount = 0;
  enemySpawnTimer = 0;
  difficulty = 1;
  player.invincible = 0;
  player.x = canvas.width / 2 - player.width / 2;
  player.updatePosition();
  // 设置当前所选等级
  setLevel(ui.selectedLevel);
  // 清空已击毁单词记录
  resetDestroyedWords();
}

// 触摸处理
input.onTouchStart = (x, y, onKeyboard) => {
  // 优先检查顶部暂停按钮
  if (ui.checkPauseButtonClick(x, y)) {
    input.touchX = null;
    return;
  }
  // 检查按钮点击（开始/重新开始/暂停界面按钮）
  const prevState = ui.state; // 记录点击前的状态
  if (ui.checkButtonClick(x, y)) {
    // 仅在从开始/结束界面进入游戏时重置对象，暂停恢复不重置
    if (prevState === 'start' || prevState === 'gameover') {
      resetGameObjects();
    }
    input.touchX = null;
    return;
  }

  // 如果没按在键盘上，且正在游戏中，控制玩家飞机位置
  if (!onKeyboard && ui.state === 'playing' && y < keyboard.getTopY()) {
    // touchX 已经设置，player会跟随
  }
};

input.onTouchMove = (x, y) => {
  if (ui.state === 'playing' && y < keyboard.getTopY()) {
    // input.touchX 已自动更新，player.update会使用
  }
};

input.onTouchEnd = () => {
  // 触摸结束
};

// 设置输入
input.setup(canvas, keyboard);

// 游戏主循环
function loop() {
  frameCount++;

  // 清屏 & 绘制背景
  drawBackground();

  // 背景音乐状态控制：playing时播放，paused时暂停，其他状态停止
  const shouldPlayBgm = ui.state === 'playing';
  if (shouldPlayBgm !== prevBgmState) {
    if (shouldPlayBgm) {
      soundManager.playBgm();
    } else {
      if (ui.state === 'paused') soundManager.pauseBgm();
      else soundManager.stopBgm();
    }
    prevBgmState = shouldPlayBgm;
  }

  if (ui.state === 'playing') {
    // 难度随时间平滑增长（每秒约+0.01，约100秒翻倍）
    difficulty = 1 + frameCount / 3600;
    // 生成间隔随时间缓慢缩短，最低45帧
    enemySpawnInterval = Math.max(45, 120 - frameCount / 180);

    // 更新玩家
    const restrictedInput = {
      left: input.left,
      right: input.right,
      touchX: (input.touchY !== null && input.touchY < keyboard.getTopY()) ? input.touchX : null
    };
    player.update(restrictedInput);

    // 生成敌机
    enemySpawnTimer++;
    if (enemySpawnTimer >= enemySpawnInterval) {
      enemySpawnTimer = 0;
      spawnEnemy();
    }

    // 更新子弹
    for (const bullet of bullets) {
      bullet.update();
    }
    bullets = bullets.filter(b => b.active);

    // 更新敌机
    const gameAreaBottom = keyboard.getTopY();
    for (const enemy of enemies) {
      enemy.update();
      // 敌机到底只是消失，不扣命，不结束游戏
    }
    enemies = enemies.filter(e => {
      if (e.destroyed) return e.destroyedAnimation <= 20;
      return e.y <= gameAreaBottom + 50;
    });

    // 子弹 & 敌机碰撞检测
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      for (const enemy of enemies) {
        if (enemy.destroyed) continue;
        if (enemy.checkCollision(bullet)) {
          bullet.active = false;
          // 检查字母是否正确（子弹的字母是点击的字母，已在onKeyPress时选了匹配敌机）
          if (enemy.checkLetterMatch(bullet.letter)) {
            enemy.hit = true;
            enemyDestroy(enemy);
            ui.addCombo();
            const base = 10;
            const bonus = ui.getComboBonus();
            ui.addScore(base * bonus);
          } else {
            // 字母不对，小爆炸但不击毁
            createExplosion(bullet.x, bullet.y, 'rgb(158, 158, 158)');
            ui.resetCombo();
          }
          break;
        }
      }
    }

    // 玩家飞机与敌机碰撞检测（无敌时跳过）
    if (player.invincible <= 0) {
      for (const enemy of enemies) {
        if (enemy.destroyed) continue;
        // AABB 碰撞检测
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
          // 碰撞：敌机爆炸，玩家扣1命，获得短暂无敌
          enemyDestroy(enemy);
          ui.loseLife();
          player.invincible = 90; // 约1.5秒无敌帧
          break;
        }
      }
    }

    // 更新粒子
    for (const p of particles) p.update();
    particles = particles.filter(p => p.life > 0);
  }

  // 绘制
  // 敌机
  for (const enemy of enemies) enemy.draw(ctx);
  // 子弹
  for (const bullet of bullets) bullet.draw(ctx);
  // 玩家（在游戏中和暂停时绘制）
  if (ui.state === 'playing' || ui.state === 'paused') player.draw(ctx);
  // 粒子
  for (const p of particles) p.draw(ctx);
  // 键盘（在游戏中和暂停时绘制）
  if (ui.state === 'playing' || ui.state === 'paused') keyboard.draw(ctx);
  // UI层（最上面）
  ui.draw(ctx, keyboard.getTopY());

  // 继续循环
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(loop);
  } else if (typeof tt !== 'undefined') {
    setTimeout(loop, 16);
  }
}

// 启动游戏
loop();
