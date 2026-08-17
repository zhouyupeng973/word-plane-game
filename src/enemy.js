import { getRandomWord, removeRandomLetter } from './words.js';

// 敌机类
export class Enemy {
  constructor(canvas, difficulty = 1) {
    this.canvas = canvas;
    this.width = 70;
    this.height = 60;
    
    // 随机x位置
    this.x = Math.random() * (canvas.width - this.width);
    this.y = -this.height;
    
    // 速度随难度缓慢增加
    this.baseSpeed = 0.6 + difficulty * 0.15;
    this.speed = this.baseSpeed + Math.random() * 0.3;
    
    this.color = '#EF5350';
    this.destroyed = false;
    this.destroyedAnimation = 0;
    
    // 生成单词（返回 {word, trans} 对象）
    const wordData = getRandomWord();
    const wordStr = wordData.word;
    const { word, missing, index } = removeRandomLetter(wordStr);
    this.fullWord = wordStr;           // 完整单词
    this.displayWord = word;            // 显示的单词（缺字母）
    this.missingLetter = missing;       // 缺失的字母
    this.missingIndex = index;          // 缺失字母的位置
    this.translation = wordData.trans || ''; // 中文释义
    
    // 字母击中状态
    this.hit = false;

    // 加载敌机图片
    this.image = null;
    this._loadImage();
  }

  _loadImage() {
    try {
      if (typeof tt !== 'undefined' && tt.createImage) {
        const img = tt.createImage();
        img.onload = () => { this.image = img; };
        img.src = 'images/enemy_plane.png';
      } else if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => { this.image = img; };
        img.src = 'images/enemy_plane.png';
      }
    } catch (e) {}
  }

  update() {
    if (this.destroyed) {
      this.destroyedAnimation++;
      return this.destroyedAnimation > 20;
    }
    this.y += this.speed;
    return this.y > this.canvas.height;
  }

  draw(ctx) {
    if (this.destroyed) {
      // 爆炸动画
      const alpha = 1 - this.destroyedAnimation / 20;
      const size = 1 + this.destroyedAnimation / 10;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FF9800';
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, this.width / 2 * size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(cx, cy, this.width / 3 * size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // 优先用图片精灵
    if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      this.drawWord(ctx);
      return;
    }

    // 回退：矢量绘制
    // 敌机机身（倒三角形）
    ctx.fillStyle = this.hit ? '#66BB6A' : this.color;
    ctx.beginPath();
    ctx.moveTo(cx, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.fill();

    // 敌机驾驶舱
    ctx.fillStyle = this.hit ? '#A5D6A7' : '#FFCDD2';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // 机翼
    ctx.fillStyle = this.hit ? '#388E3C' : '#C62828';
    ctx.fillRect(this.x - 8, this.y + 15, 10, 25);
    ctx.fillRect(this.x + this.width - 2, this.y + 15, 10, 25);

    // 绘制单词（在敌机上方）
    this.drawWord(ctx);
  }

  drawWord(ctx) {
    const word = this.displayWord;
    const wordFontSize = 18;
    const transFontSize = 12;
    const cx = this.x + this.width / 2;

    // 先画中文释义（在单词上方）
    if (this.translation) {
      ctx.font = `${transFontSize}px sans-serif`;
      ctx.fillStyle = '#FFD54F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.translation, cx, this.y - wordFontSize - 10);
    }

    // 再画英文单词（在释义下方）
    ctx.font = `bold ${wordFontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const totalWidth = ctx.measureText(word).width;
    let startX = cx - totalWidth / 2;
    const y = this.y - 8;

    // 逐个字母绘制
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const letterWidth = ctx.measureText(letter).width;

      if (i === this.missingIndex) {
        // 缺失的字母用红色高亮下划线
        ctx.fillStyle = '#FF5722';
        ctx.fillText(letter, startX + letterWidth / 2, y);
        // 画下划线
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, y + 3);
        ctx.lineTo(startX + letterWidth, y + 3);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(letter, startX + letterWidth / 2, y);
      }

      startX += letterWidth;
    }
  }

  // 检查子弹是否击中
  checkCollision(bullet) {
    if (this.destroyed) return false;
    return bullet.x > this.x && 
           bullet.x < this.x + this.width &&
           bullet.y > this.y && 
           bullet.y < this.y + this.height;
  }

  // 检查字母是否匹配
  checkLetterMatch(letter) {
    return letter.toLowerCase() === this.missingLetter.toLowerCase();
  }
}
