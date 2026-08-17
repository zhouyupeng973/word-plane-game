// 音效管理器 - 兼容抖音小游戏 tt.createInnerAudioContext 和浏览器 Audio
export class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
  }

  // 注册音效，传入相对路径（如 'audio/explosion.mp3'）
  register(name, src, volume = 1) {
    try {
      let audio;
      if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
        // 抖音小游戏环境
        audio = tt.createInnerAudioContext();
        audio.src = src;
        audio.volume = volume;
        // 预加载
        try { audio.autoplay = false; } catch (e) {}
      } else if (typeof Audio !== 'undefined') {
        // 浏览器环境
        audio = new Audio(src);
        audio.volume = volume;
        audio.preload = 'auto';
      } else {
        this.sounds[name] = null;
        return;
      }
      this.sounds[name] = { audio, src, volume };
    } catch (e) {
      this.sounds[name] = null;
    }
  }

  // 播放音效（每次触发新建实例，支持并发）
  play(name) {
    if (!this.enabled) return;
    const info = this.sounds[name];
    if (!info) return;
    try {
      if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
        // 抖音：每次播放用新实例，避免前一次被中断
        const snd = tt.createInnerAudioContext();
        snd.src = info.src;
        snd.volume = info.volume;
        snd.onEnded(() => { try { snd.destroy(); } catch (e) {} });
        snd.play();
      } else if (info.audio) {
        // 浏览器：克隆节点并发播放
        const clone = info.audio.cloneNode();
        clone.volume = info.volume;
        clone.play().catch(() => {});
      }
    } catch (e) {}
  }

  setEnabled(v) { this.enabled = v; }
}

// 全局单例
export const soundManager = new SoundManager();

// 默认音效注册（调用此方法注册项目内的音效）
export function setupSounds() {
  soundManager.register('explosion', 'audio/explosion.mp3', 0.8);
}
