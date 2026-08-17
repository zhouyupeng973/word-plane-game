// 音效管理器 - 兼容抖音小游戏 tt.createInnerAudioContext 和浏览器 Audio
export class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    // 背景音乐
    this.bgm = null;     // { audio, src, volume }
    this.bgmEnabled = true;
    // 检测平台：PC SDK 的 tt.createInnerAudioContext 有路径解析问题，PC 上改用原生 Audio
    this.useNativeAudio = this._detectPc();
  }

  _detectPc() {
    try {
      if (typeof tt !== 'undefined' && tt.getSystemInfoSync) {
        const info = tt.getSystemInfoSync();
        const platform = (info.platform || '').toLowerCase();
        // PC SDK 环境（windows / mac / pc）
        if (platform.indexOf('win') >= 0 || platform.indexOf('mac') >= 0 || platform === 'pc') {
          return true;
        }
      }
    } catch (e) {}
    // 无 tt 环境也是原生 Audio
    return typeof tt === 'undefined';
  }

  // 注册音效，传入相对路径（如 'audio/explosion.mp3'）
  register(name, src, volume = 1) {
    try {
      if (this.useNativeAudio && typeof Audio !== 'undefined') {
        // PC/浏览器环境：用原生 Audio 预加载
        const audio = new Audio(src);
        audio.volume = volume;
        audio.preload = 'auto';
        this.sounds[name] = { audio, src, volume };
      } else if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
        // 抖音小游戏移动端环境
        const audio = tt.createInnerAudioContext();
        audio.src = src;
        audio.volume = volume;
        try { audio.autoplay = false; } catch (e) {}
        this.sounds[name] = { audio, src, volume };
      } else {
        this.sounds[name] = null;
      }
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
      if (this.useNativeAudio && typeof Audio !== 'undefined') {
        // PC/浏览器：新建 Audio 实例并发播放
        const snd = new Audio(info.src);
        snd.volume = info.volume;
        snd.play().catch(() => {});
      } else if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
        // 抖音移动端：每次播放用新实例
        const snd = tt.createInnerAudioContext();
        snd.src = info.src;
        snd.volume = info.volume;
        snd.onError(() => { try { snd.destroy(); } catch (e) {} });
        snd.onEnded(() => { try { snd.destroy(); } catch (e) {} });
        snd.play();
      }
    } catch (e) {}
  }

  // === 背景音乐 ===

  // 注册背景音乐
  registerBgm(src, volume = 0.5) {
    try {
      if (this.useNativeAudio && typeof Audio !== 'undefined') {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.loop = true;
        audio.preload = 'auto';
        audio.addEventListener('error', () => {});
        this.bgm = { audio, src, volume };
      } else if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
        const audio = tt.createInnerAudioContext();
        audio.src = src;
        audio.volume = volume;
        audio.loop = true;
        audio.onError(() => {});
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
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  // 停止背景音乐
  stopBgm() {
    if (!this.bgm) return;
    try {
      if (!this.useNativeAudio && typeof tt !== 'undefined' && tt.createInnerAudioContext) {
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

  // 朗读单词（替代爆炸音效）。TTS 不可用时回退到爆炸音效。
  speakWord(word) {
    if (!this.enabled) return;
    if (!word) return;
    let ttsOk = false;
    try {
      if (typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined') {
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        utter.pitch = 1;
        utter.volume = 1;
        // 若有英语声优先用英语
        try {
          const voices = speechSynthesis.getVoices();
          const enVoice = voices.find(v => v.lang && v.lang.toLowerCase().indexOf('en') === 0);
          if (enVoice) utter.voice = enVoice;
        } catch (e) {}
        utter.onerror = () => {
          // TTS 失败兜底
          if (this.enabled) this.play('explosion');
        };
        speechSynthesis.cancel(); // 打断当前的，避免排队
        speechSynthesis.speak(utter);
        ttsOk = true;
      }
    } catch (e) {
      ttsOk = false;
    }
    if (!ttsOk) {
      this.play('explosion');
    }
  }
}

// 全局单例
export const soundManager = new SoundManager();

// 默认音效注册（调用此方法注册项目内的音效）
export function setupSounds() {
  soundManager.register('explosion', 'audio/explosion.mp3', 0.8);
  soundManager.registerBgm('audio/bgm.mp3', 0.4);
}
