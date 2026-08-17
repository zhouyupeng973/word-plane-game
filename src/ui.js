// UI管理类 - 分数、生命值、开始/结束画面
import { LEVELS } from './words.js';

export class UI {
  constructor(canvas) {
    this.canvas = canvas;
    this.score = 0;
    this.lives = 5;
    this.state = 'start'; // start, levelSelect, playing, paused, gameover
    this.highScore = 0;
    this.combo = 0;
    this.showComboTimer = 0;
    this.selectedLevel = 0; // 选中的等级索引
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  addCombo() {
    this.combo++;
    this.showComboTimer = 60;
  }

  resetCombo() {
    this.combo = 0;
  }

  getComboBonus() {
    if (this.combo >= 10) return 5;
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  }

  loseLife() {
    this.lives--;
    this.resetCombo();
    if (this.lives <= 0) {
      this.state = 'gameover';
    }
  }

  startGame() {
    this.score = 0;
    this.lives = 5;
    this.combo = 0;
    this.state = 'playing';
  }

  resetGame() {
    this.score = 0;
    this.lives = 5;
    this.combo = 0;
    this.showComboTimer = 0;
    this.state = 'playing';
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
  }

  draw(ctx, keyboardTop) {
    if (this.state === 'start') {
      this.drawStartScreen(ctx);
    } else if (this.state === 'levelSelect') {
      this.drawLevelSelectScreen(ctx);
    } else if (this.state === 'playing') {
      this.drawHUD(ctx, keyboardTop);
      this.drawPauseButton(ctx); // 暂停按钮在最顶层
    } else if (this.state === 'paused') {
      this.drawHUD(ctx, keyboardTop);
      this.drawPauseScreen(ctx);
      this.drawPauseButton(ctx); // 暂停时也显示
    } else if (this.state === 'gameover') {
      this.drawGameOver(ctx);
    }
  }

  drawHUD(ctx, keyboardTop) {
    // 顶部背景条
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.canvas.width, 50);

    // 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('分数: ' + this.score, 15, 25);

    // 生命值（爱心）- 右上角
    ctx.textAlign = 'right';
    ctx.font = '18px sans-serif';
    let heartStr = '';
    for (let i = 0; i < this.lives; i++) heartStr += '❤';
    ctx.fillStyle = '#F44336';
    ctx.fillText(heartStr, this.canvas.width - 15, 25);

    // 连击提示
    if (this.showComboTimer > 0 && this.combo >= 3) {
      this.showComboTimer--;
      const alpha = this.showComboTimer / 60;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FF9800';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const bonus = this.getComboBonus();
      ctx.fillText(this.combo + '连击! x' + bonus, this.canvas.width / 2, 90);
      ctx.restore();
    }

    // 暂停按钮在最顶层绘制（见 drawPauseButton）
  }

  // 独立绘制暂停按钮（保证在最顶层）
  drawPauseButton(ctx) {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    const pauseBtnW = 80;
    const pauseBtnH = 44;
    const pauseBtnX = this.canvas.width / 2 - pauseBtnW / 2;
    const pauseBtnY = 3;
    // 阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    // 按钮背景：亮橙色
    ctx.fillStyle = '#FF6D00';
    this.roundRect(ctx, pauseBtnX, pauseBtnY, pauseBtnW, pauseBtnH, 10);
    ctx.fill();
    // 清除阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // 白色粗描边
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    this.roundRect(ctx, pauseBtnX, pauseBtnY, pauseBtnW, pauseBtnH, 10);
    ctx.stroke();
    // 暂停图标（粗两根竖线）
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pauseBtnX + 16, pauseBtnY + 12);
    ctx.lineTo(pauseBtnX + 16, pauseBtnY + 32);
    ctx.moveTo(pauseBtnX + 26, pauseBtnY + 12);
    ctx.lineTo(pauseBtnX + 26, pauseBtnY + 32);
    ctx.stroke();
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂停', pauseBtnX + 36, pauseBtnY + pauseBtnH / 2);
  }

  drawPauseScreen(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 暂停文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('已暂停', this.canvas.width / 2, this.canvas.height * 0.35);

    // 继续按钮
    const btnX = this.canvas.width / 2 - 100;
    const btnY = this.canvas.height * 0.5;
    ctx.fillStyle = '#4CAF50';
    this.roundRect(ctx, btnX, btnY, 200, 55, 12);
    ctx.fill();
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 3;
    this.roundRect(ctx, btnX, btnY, 200, 55, 12);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('继续游戏', this.canvas.width / 2, btnY + 27);

    // 返回主页按钮
    const homeBtnY = this.canvas.height * 0.62;
    ctx.fillStyle = '#607D8B';
    this.roundRect(ctx, btnX, homeBtnY, 200, 50, 12);
    ctx.fill();
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 3;
    this.roundRect(ctx, btnX, homeBtnY, 200, 50, 12);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('返回主页', this.canvas.width / 2, homeBtnY + 25);
  }

  drawStartScreen(ctx) {
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1A237E');
    gradient.addColorStop(1, '#0D47A1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 星星装饰
    this.drawStars(ctx);

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('单词飞机大战', this.canvas.width / 2, this.canvas.height * 0.22);

    // 副标题
    ctx.fillStyle = '#90CAF9';
    ctx.font = '18px sans-serif';
    ctx.fillText('Word Plane War', this.canvas.width / 2, this.canvas.height * 0.22 + 40);

    // 游戏说明
    ctx.fillStyle = '#E3F2FD';
    ctx.font = '15px sans-serif';
    const instructions = [
      '敌机上方有缺字母的单词',
      '点击底部对应字母发射子弹',
      '字母正确才能击毁敌机！',
      '飞机碰到敌机会扣生命'
    ];
    instructions.forEach((text, i) => {
      ctx.fillText(text, this.canvas.width / 2, this.canvas.height * 0.38 + i * 28);
    });

    // 开始按钮
    const btnX = this.canvas.width / 2 - 100;
    const btnY = this.canvas.height * 0.72;
    ctx.fillStyle = '#4CAF50';
    this.roundRect(ctx, btnX, btnY, 200, 55, 12);
    ctx.fill();
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 3;
    this.roundRect(ctx, btnX, btnY, 200, 55, 12);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('开始游戏', this.canvas.width / 2, btnY + 27);

    // 最高分
    if (this.highScore > 0) {
      ctx.fillStyle = '#FFD54F';
      ctx.font = '16px sans-serif';
      ctx.fillText('最高分: ' + this.highScore, this.canvas.width / 2, this.canvas.height * 0.88);
    }
  }

  // 选级界面
  drawLevelSelectScreen(ctx) {
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1A237E');
    gradient.addColorStop(1, '#0D47A1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawStars(ctx);

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('选择难度', this.canvas.width / 2, this.canvas.height * 0.12);

    // 等级按钮（2列布局，4行）
    const btnWidth = 140;
    const btnHeight = 50;
    const marginX = 15;
    const marginY = 12;
    const startX = (this.canvas.width - (btnWidth * 2 + marginX)) / 2;
    const startY = this.canvas.height * 0.2;

    for (let i = 0; i < LEVELS.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (btnWidth + marginX);
      const y = startY + row * (btnHeight + marginY);
      const level = LEVELS[i];
      const isSelected = i === this.selectedLevel;

      // 按钮背景
      ctx.fillStyle = isSelected ? '#FF9800' : '#37474F';
      this.roundRect(ctx, x, y, btnWidth, btnHeight, 8);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#FFC107' : '#546E7A';
      ctx.lineWidth = isSelected ? 3 : 2;
      this.roundRect(ctx, x, y, btnWidth, btnHeight, 8);
      ctx.stroke();

      // 等级名称
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level.name, x + btnWidth / 2, y + btnHeight / 2 - 8);
      // 词数
      ctx.font = '11px sans-serif';
      ctx.fillStyle = isSelected ? '#FFF3E0' : '#B0BEC5';
      ctx.fillText(level.desc, x + btnWidth / 2, y + btnHeight / 2 + 10);
    }

    // 确认开始按钮
    const startBtnX = this.canvas.width / 2 - 100;
    const startBtnY = this.canvas.height * 0.85;
    ctx.fillStyle = '#4CAF50';
    this.roundRect(ctx, startBtnX, startBtnY, 200, 50, 12);
    ctx.fill();
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 3;
    this.roundRect(ctx, startBtnX, startBtnY, 200, 50, 12);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('开始游戏', this.canvas.width / 2, startBtnY + 25);

    // 返回按钮
    const backBtnY = this.canvas.height * 0.85 + 55;
    ctx.fillStyle = '#455A64';
    this.roundRect(ctx, startBtnX, backBtnY, 200, 38, 10);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px sans-serif';
    ctx.fillText('返回', this.canvas.width / 2, backBtnY + 19);
  }

  drawGameOver(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 游戏结束文字
    ctx.fillStyle = '#F44336';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height * 0.25);

    // 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('得分: ' + this.score, this.canvas.width / 2, this.canvas.height * 0.4);

    // 最高分
    ctx.fillStyle = '#FFD54F';
    ctx.font = '20px sans-serif';
    ctx.fillText('最高分: ' + this.highScore, this.canvas.width / 2, this.canvas.height * 0.46);

    // 新纪录
    if (this.score >= this.highScore && this.score > 0) {
      ctx.fillStyle = '#FF9800';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('🎉 新纪录!', this.canvas.width / 2, this.canvas.height * 0.52);
    }

    // 重新开始按钮
    const btnX = this.canvas.width / 2 - 100;
    const btnY = this.canvas.height * 0.65;
    ctx.fillStyle = '#2196F3';
    this.roundRect(ctx, btnX, btnY, 200, 55, 12);
    ctx.fill();
    ctx.strokeStyle = '#64B5F6';
    ctx.lineWidth = 3;
    this.roundRect(ctx, btnX, btnY, 200, 55, 12);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('重新开始', this.canvas.width / 2, btnY + 27);
  }

  // 检查暂停按钮点击（顶部的小暂停按钮）
  checkPauseButtonClick(x, y) {
    if (this.state !== 'playing' && this.state !== 'paused') return false;
    const pauseBtnW = 80;
    const pauseBtnH = 44;
    const pauseBtnX = this.canvas.width / 2 - pauseBtnW / 2;
    const pauseBtnY = 3;
    if (x >= pauseBtnX && x <= pauseBtnX + pauseBtnW &&
        y >= pauseBtnY && y <= pauseBtnY + pauseBtnH) {
      this.togglePause();
      return true;
    }
    return false;
  }

  // 检查按钮点击
  checkButtonClick(x, y) {
    if (this.state === 'start') {
      // 开始游戏按钮 -> 进入选级界面
      const btnX = this.canvas.width / 2 - 100;
      const btnY = this.canvas.height * 0.72;
      if (x >= btnX && x <= btnX + 200 && y >= btnY && y <= btnY + 55) {
        this.state = 'levelSelect';
        return true;
      }
    } else if (this.state === 'levelSelect') {
      // 等级选择按钮（2列布局）
      const btnWidth = 140;
      const btnHeight = 50;
      const marginX = 15;
      const marginY = 12;
      const startX = (this.canvas.width - (btnWidth * 2 + marginX)) / 2;
      const startY = this.canvas.height * 0.2;
      for (let i = 0; i < LEVELS.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = startX + col * (btnWidth + marginX);
        const by = startY + row * (btnHeight + marginY);
        if (x >= bx && x <= bx + btnWidth && y >= by && y <= by + btnHeight) {
          this.selectedLevel = i;
          return true;
        }
      }
      // 确认开始按钮
      const startBtnX = this.canvas.width / 2 - 100;
      const startBtnY = this.canvas.height * 0.85;
      if (x >= startBtnX && x <= startBtnX + 200 && y >= startBtnY && y <= startBtnY + 50) {
        this.startGame();
        return true;
      }
      // 返回按钮
      const backBtnY = this.canvas.height * 0.85 + 55;
      if (x >= startBtnX && x <= startBtnX + 200 && y >= backBtnY && y <= backBtnY + 38) {
        this.state = 'start';
        return true;
      }
    } else if (this.state === 'paused') {
      const btnX = this.canvas.width / 2 - 100;
      // 继续游戏按钮
      const continueBtnY = this.canvas.height * 0.5;
      if (x >= btnX && x <= btnX + 200 && y >= continueBtnY && y <= continueBtnY + 55) {
        this.togglePause();
        return true;
      }
      // 返回主页按钮
      const homeBtnY = this.canvas.height * 0.62;
      if (x >= btnX && x <= btnX + 200 && y >= homeBtnY && y <= homeBtnY + 50) {
        this.score = 0;
        this.lives = 5;
        this.combo = 0;
        this.showComboTimer = 0;
        this.state = 'start';
        return true;
      }
    } else if (this.state === 'gameover') {
      const btnX = this.canvas.width / 2 - 100;
      const btnY = this.canvas.height * 0.65;
      if (x >= btnX && x <= btnX + 200 && y >= btnY && y <= btnY + 55) {
        this.resetGame();
        return true;
      }
    }
    return false;
  }

  drawStars(ctx) {
    if (!this._stars) {
      this._stars = [];
      for (let i = 0; i < 60; i++) {
        this._stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          r: Math.random() * 1.5 + 0.5,
          a: Math.random()
        });
      }
    }
    for (const s of this._stars) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + s.a + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
