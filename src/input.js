// 输入管理类 - 统一处理键盘和触摸输入
export class InputManager {
  constructor() {
    this.left = false;
    this.right = false;
    this.touchX = null;
    this.touchY = null;
    this.touchStartX = null;
    this.onKeyDown = null;
    this.onTouchStart = null;
    this.onTouchMove = null;
    this.onTouchEnd = null;
  }

  setup(canvas, keyboard) {
    // 键盘事件（调试用）
    try {
      tt.onKeyDown && tt.onKeyDown((res) => {
        switch (res.key) {
          case 'ArrowLeft':
            this.left = true;
            break;
          case 'ArrowRight':
            this.right = true;
            break;
        }
        if (this.onKeyDown) {
          this.onKeyDown(res.key);
        }
        if (keyboard) {
          keyboard.handleKeyDown(res.key);
        }
      });

      tt.onKeyUp && tt.onKeyUp((res) => {
        switch (res.key) {
          case 'ArrowLeft':
            this.left = false;
            break;
          case 'ArrowRight':
            this.right = false;
            break;
        }
      });
    } catch (e) {
      console.log('tt keyboard not available');
    }

    // 触摸事件
    try {
      tt.onTouchStart && tt.onTouchStart((res) => {
        const touch = res.touches[0];
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
        this.touchStartX = touch.clientX;

        // 先判断是否按在键盘上
        let onKeyboard = false;
        if (keyboard) {
          onKeyboard = keyboard.handleTouch(this.touchX, this.touchY);
        }

        if (this.onTouchStart) {
          this.onTouchStart(this.touchX, this.touchY, onKeyboard);
        }
      });

      tt.onTouchMove && tt.onTouchMove((res) => {
        const touch = res.touches[0];
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
        
        if (this.onTouchMove) {
          this.onTouchMove(this.touchX, this.touchY);
        }
      });

      tt.onTouchEnd && tt.onTouchEnd(() => {
        this.touchX = null;
        this.touchY = null;
        this.touchStartX = null;
        
        if (this.onTouchEnd) {
          this.onTouchEnd();
        }
      });
    } catch (e) {
      console.log('tt touch not available');
    }
  }
}
