/**
 * 可替换的随机源。
 * 默认使用 Math.random；测试或录像可通过 setRng 注入确定性序列。
 */

export type Rng = () => number;

const defaultRng: Rng = () => Math.random();
let current: Rng = defaultRng;

export function setRng(fn: Rng): void {
  current = fn;
}

export function resetRng(): void {
  current = defaultRng;
}

/** [0, 1) */
export function rng(): number {
  const v = current();
  return v >= 1 ? 0.999999 : v < 0 ? 0 : v;
}

/** 闭区间整数 [min, max] */
export function randInt(min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Fisher-Yates，返回新数组，不改原数组 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickMany<T>(arr: readonly T[], count: number): T[] {
  return shuffle(arr).slice(0, Math.min(count, arr.length));
}

/** 可复现的种子随机（mulberry32），便于调试 */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
