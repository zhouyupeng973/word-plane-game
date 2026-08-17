// 单词库 - 包含常用英语单词，用于随机生成敌机上的单词
const WORD_LIST = [
  'cat', 'dog', 'sun', 'run', 'cup', 'pen', 'box', 'fox', 'hat', 'bat',
  'map', 'car', 'bus', 'bed', 'red', 'big', 'pig', 'egg', 'leg', 'bag',
  'apple', 'happy', 'water', 'music', 'light', 'night', 'smile', 'dream',
  'cloud', 'river', 'beach', 'grass', 'green', 'black', 'white', 'brown',
  'plane', 'space', 'earth', 'world', 'power', 'super', 'magic', 'speed',
  'brave', 'smart', 'funny', 'lucky', 'sunny', 'rainy', 'windy', 'snowy',
  'tiger', 'panda', 'horse', 'sheep', 'zebra', 'eagle', 'shark', 'whale',
  'plant', 'flower', 'garden', 'forest', 'orange', 'banana', 'grape', 'lemon',
  'school', 'friend', 'family', 'mother', 'father', 'sister', 'brother', 'teacher',
  'pencil', 'ruler', 'book', 'desk', 'chair', 'clock', 'phone', 'robot'
];

// 获取随机单词
export function getRandomWord() {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

// 从单词中随机删除一个字母，返回新单词和被删除的字母
export function removeRandomLetter(word) {
  if (word.length < 2) return { word: word, missing: word[0], index: 0 };
  const index = Math.floor(Math.random() * word.length);
  const missing = word[index];
  const newWord = word.slice(0, index) + '_' + word.slice(index + 1);
  return { word: newWord, missing: missing, index: index };
}

export { WORD_LIST };
