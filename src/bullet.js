// 子弹类
export class Bullet {
  constructor(x, y, letter) {
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 20;
    this.speed = 12;
    this.letter = letter.toUpperCase();
    this.color = '#FFEB3B';
    this.active = true;
  }

  update() {
    this.y -= this.speed;
    if (this.y < -this.height) {
      this.active = false;
    }
  }

  draw(ctx) {
    // 子弹本体
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 子弹发光效果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.width / 3, this.height / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 字母标识
    ctx.fillStyle = '#F57C00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.letter, this.x, this.y);
  }
}
