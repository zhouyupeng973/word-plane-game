// 抖音小游戏平台能力 SDK 模块
// 侧边栏复访、插屏广告、激励广告

// 是否从侧边栏进入
let fromSidebar = false;

// 激励广告实例
let rewardedAd = null;
// 插屏广告实例
let interstitialAd = null;

// 激励广告回调
let onRewardCallback = null;

/**
 * 初始化平台能力
 */
export function initSDK() {
  if (typeof tt === 'undefined') return;

  // 检查启动场景
  try {
    const options = tt.getLaunchOptionsSync();
    if (options && options.scene === 'sidebar') {
      fromSidebar = true;
    }
  } catch (e) {}

  // 监听 onShow，更新场景来源
  try {
    tt.onShow((res) => {
      if (res && res.scene === 'sidebar') {
        fromSidebar = true;
      }
    });
  } catch (e) {}

  // 初始化激励广告
  try {
    rewardedAd = tt.createRewardedVideoAd({ adUnitId: '' }); // 填入你的广告单元ID
    rewardedAd.onClose((res) => {
      if (res && res.isEnded) {
        // 观看完成，发放奖励
        if (onRewardCallback) {
          onRewardCallback(true);
          onRewardCallback = null;
        }
      } else {
        // 未观看完成
        if (onRewardCallback) {
          onRewardCallback(false);
          onRewardCallback = null;
        }
      }
    });
    rewardedAd.onError((err) => {
      console.log('激励广告加载失败', err);
      if (onRewardCallback) {
        onRewardCallback(false);
        onRewardCallback = null;
      }
    });
  } catch (e) {
    console.log('激励广告初始化失败', e);
  }

  // 初始化插屏广告
  try {
    interstitialAd = tt.createInterstitialAd({ adUnitId: '' }); // 填入你的广告单元ID
    interstitialAd.onError((err) => {
      console.log('插屏广告加载失败', err);
    });
  } catch (e) {
    console.log('插屏广告初始化失败', e);
  }
}

/**
 * 侧边栏复访：跳转到侧边栏场景
 */
export function navigateToSidebar() {
  if (typeof tt === 'undefined') return false;
  try {
    tt.navigateToScene({
      scene: 'sidebar',
      success: () => {},
      fail: () => {}
    });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 是否从侧边栏进入
 */
export function isFromSidebar() {
  return fromSidebar;
}

/**
 * 显示插屏广告
 */
export function showInterstitialAd() {
  if (typeof tt === 'undefined' || !interstitialAd) return;
  try {
    interstitialAd.show().catch(() => {
      // show 失败则重新加载
      interstitialAd.load().then(() => interstitialAd.show()).catch(() => {});
    });
  } catch (e) {}
}

/**
 * 展示激励广告
 * @param {Function} callback 观看完成回调 (true=完成, false=未完成)
 */
export function showRewardedAd(callback) {
  if (typeof tt === 'undefined' || !rewardedAd) {
    callback(false);
    return;
  }
  onRewardCallback = callback;
  try {
    rewardedAd.show().catch(() => {
      // show 失败则重新加载
      rewardedAd.load().then(() => rewardedAd.show()).catch(() => {
        callback(false);
        onRewardCallback = null;
      });
    });
  } catch (e) {
    callback(false);
    onRewardCallback = null;
  }
}
