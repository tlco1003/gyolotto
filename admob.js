// src/admob.js
// ────────────────────────────────────────────
// Capacitor AdMob 보상형 광고 모듈
// 앱 ID     : ca-app-pub-2742724350280673~2859430456
// 광고단위ID : ca-app-pub-2742724350280673/2592804749
// ────────────────────────────────────────────

import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

// ── 테스트용 ID (개발 중 항상 이걸로 확인)
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

// ── 실제 배포용 ID
const REAL_REWARDED_ID = 'ca-app-pub-2742724350280673/2592804749';

// ── 배포 빌드면 true로 바꿔
const IS_PRODUCTION = false;

const REWARDED_ID = IS_PRODUCTION ? REAL_REWARDED_ID : TEST_REWARDED_ID;

/**
 * AdMob 초기화 — MainApp 마운트 시 1회 호출
 */
export async function initAdMob() {
  try {
    await AdMob.initialize({
      requestTrackingAuthorization: false, // iOS ATT (Android는 무시됨)
      testingDevices: [],                  // 실기기 테스트 시 GAID 추가 가능
      initializeForTesting: !IS_PRODUCTION // 테스트 모드
    });
    console.log('[AdMob] 초기화 완료 / 모드:', IS_PRODUCTION ? 'PRODUCTION' : 'TEST');
  } catch (err) {
    console.error('[AdMob] 초기화 실패:', err);
  }
}

/**
 * 보상형 광고 표시
 * @param {object} opts
 * @param {() => void}      opts.onReward  광고 완료 → 보상 지급 콜백
 * @param {(msg:string)=>void} opts.onError 에러 콜백
 */
export async function showRewardedAd({ onReward, onError }) {
  let rewardEarned = false;

  // ── 리스너 등록
  const rewardListener = await AdMob.addListener(
    RewardAdPluginEvents.Rewarded,
    () => {
      // Google 정책: OnUserEarnedRewardListener 시점에 보상 지급
      rewardEarned = true;
      if (typeof onReward === 'function') onReward();
    }
  );

  const dismissListener = await AdMob.addListener(
    RewardAdPluginEvents.Dismissed,
    async () => {
      await _cleanup(rewardListener, dismissListener, failListener);
      if (!rewardEarned) {
        // 광고 끝까지 안 본 경우 — 보상 없음 (정상 케이스)
        console.log('[AdMob] 광고 조기 종료 — 보상 미지급');
      }
    }
  );

  const failListener = await AdMob.addListener(
    RewardAdPluginEvents.FailedToLoad,
    async (error) => {
      await _cleanup(rewardListener, dismissListener, failListener);
      const msg = error?.message || '광고 로드 실패';
      console.error('[AdMob] 로드 실패:', msg);
      if (typeof onError === 'function') onError(msg);
    }
  );

  // ── 광고 로드 & 표시
  try {
    await AdMob.prepareRewardVideoAd({
      adId: REWARDED_ID,
      isTesting: !IS_PRODUCTION
    });
    await AdMob.showRewardVideoAd();
  } catch (err) {
    await _cleanup(rewardListener, dismissListener, failListener);
    const msg = err?.message || '광고 표시 실패';
    console.error('[AdMob] 표시 오류:', msg);
    if (typeof onError === 'function') onError(msg);
  }
}

// ── 리스너 일괄 제거 헬퍼
async function _cleanup(...listeners) {
  for (const l of listeners) {
    try { await l.remove(); } catch (_) {}
  }
}
