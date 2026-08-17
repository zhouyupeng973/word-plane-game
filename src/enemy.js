import { getRandomWord, removeRandomLetter } from './words.js';

// 敌机类
export class Enemy {
  constructor(canvas, difficulty = 1) {
    this.canvas = canvas;
    
    // 生成单词（返回 {word, trans} 对象）
    const wordData = getRandomWord();
    const wordStr = wordData.word;
    const { word, missing, index } = removeRandomLetter(wordStr);
    this.fullWord = wordStr;           // 完整单词
    this.displayWord = word;            // 显示的单词（缺字母）
    this.missingLetter = missing;       // 缺失的字母
    this.missingIndex = index;          // 缺失字母的位置
    this.translation = wordData.trans || ''; // 中文释义
    
    // 根据单词长度决定机型：短单词用小敌机，长单词用轰炸机
    const len = wordStr.length;
    let sizeType;
    if (len <= 5) {
      sizeType = 'small';   // 小型战斗机
    } else {
      sizeType = 'bomber';  // 轰炸机
    }
    
    // 各机型尺寸、颜色、速度系数
    const config = {
      small:  { w: 60, h: 50, color: '#EF5350', speedMul: 1.2 },
      bomber: { w: 110, h: 95, color: '#5C6BC0', speedMul: 0.6 }
    };
    const cfg = config[sizeType];
    
    this.width = cfg.w;
    this.height = cfg.h;
    this.color = cfg.color;
    this.sizeType = sizeType;
    
    // 随机x位置（确保不超出屏幕）
    this.x = Math.random() * (canvas.width - this.width);
    this.y = -this.height;
    
    // 速度随难度缓慢增加，大飞机更慢
    this.baseSpeed = (0.6 + difficulty * 0.15) * cfg.speedMul;
    this.speed = this.baseSpeed + Math.random() * 0.3;
    
    this.destroyed = false;
    this.destroyedAnimation = 0;
    
    // 字母击中状态
    this.hit = false;

    // 加载敌机图片
    this.image = null;
    this._loadImage();
  }

  _loadImage() {
    const src = this.sizeType === 'bomber' ? 'images/bomber_plane.png' : 'images/enemy_plane.png';
    try {
      if (typeof tt !== 'undefined' && tt.createImage) {
        const img = tt.createImage();
        img.onload = () => { this.image = img; };
        img.src = src;
      } else if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => { this.image = img; };
        img.src = src;
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

    // 回退：矢量绘制（根据机型不同形状）
    const t = this.sizeType;
    ctx.fillStyle = this.hit ? '#66BB6A' : this.color;

    if (t === 'small') {
      // 小型战斗机：倒三角
      ctx.beginPath();
      ctx.moveTo(cx, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.lineTo(this.x, this.y);
      ctx.closePath();
      ctx.fill();
    } else {
      // 轰炸机：宽大机身 + 多翼 + 双引擎
      ctx.beginPath();
      ctx.moveTo(cx, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y + 20);
      ctx.lineTo(this.x + this.width * 0.8, this.y);
      ctx.lineTo(this.x + this.width * 0.2, this.y);
      ctx.lineTo(this.x, this.y + 20);
      ctx.closePath();
      ctx.fill();
      // 翼
      ctx.fillStyle = this.hit ? '#388E3C' : '#3949AB';
      ctx.fillRect(this.x - 12, this.y + 30, 16, 30);
      ctx.fillRect(this.x + this.width - 4, this.y + 30, 16, 30);
      ctx.fillRect(this.x + this.width * 0.3, this.y + 35, 14, 25);
      ctx.fillRect(this.x + this.width * 0.55, this.y + 35, 14, 25);
    }

    // 驾驶舱
    ctx.fillStyle = this.hit ? '#A5D6A7' : '#FFCDD2';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, t === 'bomber' ? 10 : 8, 0, Math.PI * 2);
    ctx.fill();

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
