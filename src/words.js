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

// 获取当前等级配置
export function getCurrentLevelConfig() {
  return LEVELS[currentLevel] || LEVELS[0];
}

// 获取随机单词（从当前等级词库中，返回 {word, trans})
export function getRandomWord() {
  const config = getCurrentLevelConfig();
  const words = config.words;
  const item = words[Math.floor(Math.random() * words.length)];
  return item;
}

// 从单词中随机删除一个字母，返回新单词和被删除的字母
export function removeRandomLetter(word) {
  if (word.length < 2) return { word: word, missing: word[0], index: 0 };
  const index = Math.floor(Math.random() * word.length);
  const missing = word[index];
  const newWord = word.slice(0, index) + '_' + word.slice(index + 1);
  return { word: newWord, missing: missing, index: index };
}
