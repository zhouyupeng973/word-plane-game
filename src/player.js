// 玩家飞机类
export class Player {
  constructor(canvas, keyboard) {
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.width = 60;
    this.height = 70;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 30; // 初始值，updatePosition 会修正
    this.speed = 8;
    this.color = '#4FC3F7';
    this.invincible = 0; // 无敌帧计时器
    this.updatePosition();
  }

  // 根据 keyboard 顶部位置，将飞机放到键盘正上方
  updatePosition() {
    const topY = this.keyboard ? this.keyboard.getTopY() : (this.canvas.height - 30);
    this.y = topY - this.height - 5;
  }

  update(input) {
    // 无敌帧倒计时
    if (this.invincible > 0) this.invincible--;
    // 触摸/鼠标移动
    if (input.touchX !== null) {
      this.x = input.touchX - this.width / 2;
    } else {
      // 键盘左右移动
      if (input.left) this.x -= this.speed;
      if (input.right) this.x += this.speed;
    }
    // 边界检查
    if (this.x < 0) this.x = 0;
    if (this.x > this.canvas.width - this.width) this.x = this.canvas.width - this.width;
  }

  draw(ctx) {
    // 无敌时闪烁
    if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) {
      return; // 跳过本帧绘制，形成闪烁效果
    }
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // 飞机机身
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(cx, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.lineTo(cx, this.y + this.height - 15);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();

    // 驾驶舱
    ctx.fillStyle = '#81D4FA';
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // 尾翼
    ctx.fillStyle = '#0288D1';
    ctx.beginPath();
    ctx.moveTo(this.x + 5, this.y + this.height);
    ctx.lineTo(this.x + 15, this.y + this.height - 20);
    ctx.lineTo(this.x + 10, this.y + this.height);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.x + this.width - 5, this.y + this.height);
    ctx.lineTo(this.x + this.width - 15, this.y + this.height - 20);
    ctx.lineTo(this.x + this.width - 10, this.y + this.height);
    ctx.closePath();
    ctx.fill();
  }

  getBulletX() {
    return this.x + this.width / 2;
  }

  getBulletY() {
    return this.y;
  }
}
