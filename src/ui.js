// UI管理类 - 分数、生命值、开始/结束画面
export class UI {
  constructor(canvas) {
    this.canvas = canvas;
    this.score = 0;
    this.lives = 5;
    this.state = 'start'; // start, playing, gameover
    this.highScore = 0;
    this.combo = 0;
    this.showComboTimer = 0;
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
    this.state = 'start';
  }

  draw(ctx, keyboardTop) {
    if (this.state === 'start') {
      this.drawStartScreen(ctx);
    } else if (this.state === 'playing') {
      this.drawHUD(ctx, keyboardTop);
    } else if (this.state === 'gameover') {
      this.drawGameOver(ctx);
    }
  }

  drawHUD(ctx, keyboardTop) {
    // 顶部背景条
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, 50);

    // 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('分数: ' + this.score, 15, 25);

    // 生命值（爱心）
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
      '敌机到底会扣生命'
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

  // 检查按钮点击
  checkButtonClick(x, y) {
    if (this.state === 'start') {
      const btnX = this.canvas.width / 2 - 100;
      const btnY = this.canvas.height * 0.72;
      if (x >= btnX && x <= btnX + 200 && y >= btnY && y <= btnY + 55) {
        this.startGame();
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
