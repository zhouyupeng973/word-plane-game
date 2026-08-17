// 音效管理器 - 兼容抖音小游戏 tt.createInnerAudioContext 和浏览器 Audio
export class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    // 背景音乐
    this.bgm = null;     // { audio, src, volume }
    this.bgmEnabled = true;
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
        snd.onError(() => { try { snd.destroy(); } catch (e) {} });
        snd.onEnded(() => { try { snd.destroy(); } catch (e) {} });
        snd.play();
      } else if (info.audio) {
        // 浏览器：新建 Audio 实例并发播放（cloneNode 可能丢失 src）
        const snd = new Audio(info.src);
        snd.volume = info.volume;
        snd.play().catch(() => {});
      }
    } catch (e) {}
  }

  // === 背景音乐 ===

  // 注册背景音乐
  registerBgm(src, volume = 0.5) {
    try {
      if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
        const audio = tt.createInnerAudioContext();
        audio.src = src;
        audio.volume = volume;
        audio.loop = true;
        audio.onError(() => {});
        this.bgm = { audio, src, volume };
      } else if (typeof Audio !== 'undefined') {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.loop = true;
        audio.preload = 'auto';
        audio.addEventListener('error', () => {});
        this.bgm = { audio, src, volume };
      }
    } catch (e) {
      this.bgm = null;
    }
  }

  // 播放背景音乐
  playBgm() {
    if (!this.bgmEnabled || !this.bgm) return;
    try {
      const p = this.bgm.audio.play();
      // 浏览器环境 play() 返回 Promise，捕获可能的拒绝
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  // 停止背景音乐
  stopBgm() {
    if (!this.bgm) return;
    try {
      if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
        this.bgm.audio.stop();
      } else {
        this.bgm.audio.pause();
        this.bgm.audio.currentTime = 0;
      }
    } catch (e) {}
  }

  // 暂停背景音乐（恢复时可继续）
  pauseBgm() {
    if (!this.bgm) return;
    try {
      this.bgm.audio.pause();
    } catch (e) {}
  }

  setEnabled(v) { this.enabled = v; }
  setBgmEnabled(v) {
    this.bgmEnabled = v;
    if (!v) this.stopBgm();
  }
}

// 全局单例
export const soundManager = new SoundManager();

// 默认音效注册（调用此方法注册项目内的音效）
export function setupSounds() {
  soundManager.register('explosion', 'audio/explosion.mp3', 0.8);
  soundManager.registerBgm('audio/bgm.mp3', 0.4);
}
