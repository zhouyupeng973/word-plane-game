// 单词库管理 - 支持多等级词库
import { WORDS as L1 } from './words_level1.js';
import { WORDS as L2 } from './words_level2.js';
import { WORDS as L3 } from './words_level3.js';
import { WORDS as L4 } from './words_level4.js';
import { WORDS as L5 } from './words_level5.js';
import { WORDS as L6 } from './words_level6.js';
import { WORDS as L7 } from './words_level7.js';

// 等级配置
export const LEVELS = [
  { id: 1, name: '初中', desc: '3223词', words: L1 },
  { id: 2, name: '高中', desc: '6008词', words: L2 },
  { id: 3, name: '四级', desc: '7508词', words: L3 },
  { id: 4, name: '六级', desc: '5651词', words: L4 },
  { id: 5, name: '考研', desc: '9602词', words: L5 },
  { id: 6, name: '托福', desc: '13477词', words: L6 },
  { id: 7, name: 'SAT', desc: '8887词', words: L7 },
];

// 当前选中的等级
let currentLevel = 0;

// 设置当前等级
export function setLevel(levelId) {
  currentLevel = levelId;
}

// 获取当前等级
export function getCurrentLevel() {
  return currentLevel;
}

// 已击毁的单词集合（本局游戏中不再出现）
const destroyedWords = new Set();

// 记录已击毁的单词
export function markWordDestroyed(word) {
  destroyedWords.add(word);
}

// 重置已击毁单词记录（重新开始游戏时调用）
export function resetDestroyedWords() {
  destroyedWords.clear();
}

// 获取当前等级配置
export function getCurrentLevelConfig() {
  return LEVELS[currentLevel] || LEVELS[0];
}

// 获取随机单词（从当前等级词库中，返回 {word, trans}，跳过已击毁的单词）
// 如果全部击毁则返回 null（表示通关）
export function getRandomWord() {
  const config = getCurrentLevelConfig();
  const words = config.words;
  // 全部击毁，返回 null 表示通关
  if (destroyedWords.size >= words.length) {
    return null;
  }
  // 最多尝试 50 次找一个未击毁的单词
  let item;
  for (let i = 0; i < 50; i++) {
    item = words[Math.floor(Math.random() * words.length)];
    if (!destroyedWords.has(item.word)) {
      return item;
    }
  }
  // 兜底：遍历找一个未击毁的
  for (const w of words) {
    if (!destroyedWords.has(w.word)) return w;
  }
  return null; // 全部击毁
}

// 从单词中随机删除一个字母，返回新单词和被删除的字母
export function removeRandomLetter(word) {
  if (word.length < 2) return { word: word, missing: word[0], index: 0 };
  const index = Math.floor(Math.random() * word.length);
  const missing = word[index];
  const newWord = word.slice(0, index) + '_' + word.slice(index + 1);
  return { word: newWord, missing: missing, index: index };
}
