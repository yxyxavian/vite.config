export interface SaveData {
  bestNode: number;
  bestTimeMs: number;
  wins: number;
  runs: number;
  lastPlayedAt: string;
  settings: { sound: boolean };
}

const KEY = 'knight_trials_save_v1';

const DEFAULT_SAVE: SaveData = {
  bestNode: 0,
  bestTimeMs: 0,
  wins: 0,
  runs: 0,
  lastPlayedAt: '',
  settings: { sound: false },
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      bestNode: Number(parsed.bestNode) || 0,
      bestTimeMs: Number(parsed.bestTimeMs) || 0,
      wins: Number(parsed.wins) || 0,
      runs: Number(parsed.runs) || 0,
      lastPlayedAt: typeof parsed.lastPlayedAt === 'string' ? parsed.lastPlayedAt : '',
      settings: { sound: Boolean(parsed.settings?.sound) },
    };
  } catch {
    return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
  }
}

export function writeSave(data: SaveData): void {
  try {
    data.lastPlayedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* localStorage 不可用时静默失败，不影响游戏进行 */
  }
}

export function bumpRun(): SaveData {
  const s = loadSave();
  s.runs += 1;
  writeSave(s);
  return s;
}

export function recordProgress(nodeReached: number, timeMs: number, won: boolean): SaveData {
  const s = loadSave();
  if (nodeReached > s.bestNode) s.bestNode = nodeReached;
  if (won) {
    s.wins += 1;
    if (s.bestTimeMs === 0 || timeMs < s.bestTimeMs) s.bestTimeMs = timeMs;
  }
  writeSave(s);
  return s;
}

export function formatTime(ms: number): string {
  if (!ms || ms <= 0) return '--:--';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function resetSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
