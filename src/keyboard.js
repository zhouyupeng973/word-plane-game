// 字母键盘UI - 在屏幕底部显示26个字母按钮
export class Keyboard {
  constructor(canvas) {
    this.canvas = canvas;
    this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];
    
    this.keyHeight = 38;
    this.keyMargin = 4;
    this.bottomPadding = 8;
    this.pressedKeys = {};
    
    this.onKeyPress = null;
    
    // 计算键盘总高度
    this.totalHeight = this.rows.length * (this.keyHeight + this.keyMargin) + this.bottomPadding;
  }

  getTopY() {
    return this.canvas.height - this.totalHeight;
  }

  getKeyWidth() {
    const maxRowLen = Math.max(...this.rows.map(r => r.length));
    const totalMargin = (maxRowLen + 1) * this.keyMargin;
    return (this.canvas.width - totalMargin) / maxRowLen;
  }

  // 获取所有按键的位置信息
  getKeyRects() {
    const rects = [];
    const keyWidth = this.getKeyWidth();
    let y = this.getTopY();

    for (const row of this.rows) {
      const rowWidth = row.length * (keyWidth + this.keyMargin) - this.keyMargin;
      let x = (this.canvas.width - rowWidth) / 2;

      for (const letter of row) {
        rects.push({
          letter: letter,
          x: x,
          y: y,
          width: keyWidth,
          height: this.keyHeight
        });
        x += keyWidth + this.keyMargin;
      }
      y += this.keyHeight + this.keyMargin;
    }
    return rects;
  }

  handleTouch(touchX, touchY) {
    const rects = this.getKeyRects();
    for (const rect of rects) {
      if (touchX >= rect.x && touchX <= rect.x + rect.width &&
          touchY >= rect.y && touchY <= rect.y + rect.height) {
        this.pressedKeys[rect.letter] = true;
        setTimeout(() => { this.pressedKeys[rect.letter] = false; }, 100);
        if (this.onKeyPress) {
          this.onKeyPress(rect.letter);
        }
        return true;
      }
    }
    return false;
  }

  handleKeyDown(key) {
    const letter = key.toUpperCase();
    if (this.letters.includes(letter)) {
      this.pressedKeys[letter] = true;
      setTimeout(() => { this.pressedKeys[letter] = false; }, 100);
      if (this.onKeyPress) {
        this.onKeyPress(letter);
      }
    }
  }

  draw(ctx) {
    const rects = this.getKeyRects();
    const keyWidth = this.getKeyWidth();

    for (const rect of rects) {
      const isPressed = this.pressedKeys[rect.letter];
      
      // 按键背景
      ctx.fillStyle = isPressed ? '#1976D2' : '#455A64';
      this.roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 6);
      ctx.fill();

      // 按键边框
      ctx.strokeStyle = isPressed ? '#64B5F6' : '#78909C';
      ctx.lineWidth = 2;
      this.roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 6);
      ctx.stroke();

      // 字母
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rect.letter, rect.x + rect.width / 2, rect.y + rect.height / 2);
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
