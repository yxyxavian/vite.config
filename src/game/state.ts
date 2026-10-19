import type { CardDef, EnemyDef, EventOption, RunState } from './types';
import { CARD_BY_ID, makeStartingDeck, rewardPool } from './cards';
import { BOSS, NORMAL_ENEMIES, MID_ENEMIES, LATE_ENEMIES, makeElite } from './enemies';
import { ALL_RELICS, RELIC_BY_ID } from './relics';
import { ALL_EVENTS } from './events';
import { NODE_META, buildRandomMap } from './map';
import { battleLost, battleWon, createBattle, hasRelic } from './combat';
import { pick, pickMany } from './rng';
import { bumpRun, loadSave, recordProgress, type SaveData } from './save';

export interface Game {
  run: RunState | null;
  save: SaveData;
}

export const game: Game = {
  run: null,
  save: loadSave(),
};

export function currentRun(): RunState {
  if (!game.run) throw new Error('还没有进行中的对局');
  return game.run;
}

export function hasRun(): boolean {
  return game.run !== null;
}

/* ---------------- 开局 ---------------- */

export function startNewRun(): RunState {
  game.save = bumpRun();
  const run: RunState = {
    screen: 'map',
    map: buildRandomMap(Math.random),
    nodeIndex: 0,
    playerHp: 35,
    playerMaxHp: 35,
    deck: makeStartingDeck(),
    relics: [],
    gold: 0,
    startTime: Date.now(),
    endTime: null,
    result: null,
    battle: null,
    rewardChoices: null,
    rewardRelicChoices: null,
    eventDef: null,
    eventResult: null,
    pendingRemove: false,
    pendingCardChoices: null,
    message: null,
    nodeResults: [],
  };
  game.run = run;
  return run;
}

export function abandonRun(): void {
  game.run = null;
}

/* ---------------- 节点 ---------------- */

export function nodeKindAt(run: RunState, index: number) {
  return run.map[index].kind;
}

/** 敌人生命随路线进度成长：越往后越强 */
function scaledHp(baseHp: number, nodeIndex: number): number {
  return baseHp + Math.floor(nodeIndex * 1.0);
}

/** 按路线进度选敌人池：前段新手怪，中段混编，后段强敌 */
function enemyPoolFor(run: RunState): EnemyDef[] {
  const progress = run.nodeIndex / Math.max(1, run.map.length - 1);
  if (progress < 0.4) return NORMAL_ENEMIES;
  if (progress < 0.72) return [...NORMAL_ENEMIES, ...MID_ENEMIES];
  return [...MID_ENEMIES, ...LATE_ENEMIES];
}

export function enterCurrentNode(): void {
  const run = currentRun();
  if (run.nodeIndex >= run.map.length) return;
  const kind = run.map[run.nodeIndex].kind;

  if (kind === 'battle' || kind === 'elite' || kind === 'boss') {
    let enemy;
    if (kind === 'boss') {
      enemy = { ...BOSS, hp: scaledHp(BOSS.hp, run.nodeIndex) };
    } else if (kind === 'elite') {
      const base = pick(enemyPoolFor(run));
      enemy = makeElite({ ...base, hp: scaledHp(base.hp, run.nodeIndex) });
    } else {
      const base = pick(enemyPoolFor(run));
      enemy = { ...base, hp: scaledHp(base.hp, run.nodeIndex) };
    }
    run.battle = createBattle(enemy, run);
    run.screen = 'battle';
    return;
  }

  if (kind === 'camp') {
    run.eventResult = null;
    run.pendingRemove = false;
    run.pendingCardChoices = null;
    run.screen = 'camp';
    return;
  }

  // 事件
  run.eventDef = pick(ALL_EVENTS);
  run.eventResult = null;
  run.pendingRemove = false;
  run.pendingCardChoices = null;
  run.screen = 'event';
}

/* ---------------- 休营地 ---------------- */

export function campHealAmount(run: RunState): number {
  return Math.max(3, Math.floor(run.playerMaxHp * 0.3));
}

export function resolveCampHeal(): void {
  const run = currentRun();
  const amount = campHealAmount(run);
  const before = run.playerHp;
  run.playerHp = Math.min(run.playerMaxHp, run.playerHp + amount);
  const healed = run.playerHp - before;
  run.eventResult = healed > 0 ? `你在篝火旁休整，恢复了 ${healed} 点生命。` : '生命已满，好好休息了一晚。';
}

export function resolveCampRemove(): void {
  const run = currentRun();
  run.pendingRemove = true;
  run.eventResult = null;
}

export function leaveCamp(): void {
  const run = currentRun();
  run.eventResult = null;
  run.pendingRemove = false;
  run.nodeIndex += 1;
  if (run.nodeIndex >= run.map.length) {
    run.screen = 'result';
    return;
  }
  run.screen = 'map';
}

/* ---------------- 战斗结算 ---------------- */

export function finishBattle(): void {
  const run = currentRun();
  const s = run.battle;
  if (!s) return;

  if (battleLost(s, run)) {
    run.result = 'lose';
    run.screen = 'result';
    run.endTime = Date.now();
    run.battle = null;
    game.save = recordProgress(run.nodeIndex + 1, 0, false);
    return;
  }

  if (!battleWon(s, run)) return;

  // 急救包
  if (hasRelic(run, 'first-aid')) {
    const before = run.playerHp;
    run.playerHp = Math.min(run.playerMaxHp, run.playerHp + 3);
    if (run.playerHp > before) {
      s.log.push({ text: '【急救包】战斗结束恢复 3 点生命。', kind: 'good' });
    }
  }

  // 精英战后小憩，补偿长局消耗
  if (s.enemyDef.tier === 'elite' && run.playerHp < run.playerMaxHp) {
    const before = run.playerHp;
    const heal = 4 + Math.floor(run.nodeIndex / 6);
    run.playerHp = Math.min(run.playerMaxHp, run.playerHp + heal);
    if (run.playerHp > before) {
      s.log.push({ text: `战后休整，恢复 ${run.playerHp - before} 点生命。`, kind: 'good' });
    }
  }

  const wasBoss = s.enemyDef.tier === 'boss';
  const wasElite = s.enemyDef.tier === 'elite';
  run.nodeResults.push({
    index: run.nodeIndex,
    label: `击破 ${s.enemyDef.name}`,
  });
  run.battle = null;

  if (wasBoss) {
    run.result = 'win';
    run.screen = 'result';
    run.endTime = Date.now();
    const elapsed = run.endTime - run.startTime;
    game.save = recordProgress(run.map.length, elapsed, true);
    return;
  }

  // 普通 / 精英：三选一奖励
  run.rewardChoices = pickMany(rewardPool(), 3);
  run.rewardRelicChoices = wasElite ? pickMany(unownedRelics(run), 3).map((r) => r.id) : null;
  if (run.rewardRelicChoices && run.rewardRelicChoices.length === 0) {
    run.rewardRelicChoices = null;
  }
  run.screen = 'reward';
}

function unownedRelics(run: RunState) {
  const owned = new Set(run.relics);
  return ALL_RELICS.filter((r) => !owned.has(r.id));
}

export function pickRewardCard(index: number): void {
  const run = currentRun();
  if (!run.rewardChoices) return;
  if (index >= 0 && index < run.rewardChoices.length) {
    run.deck.push(run.rewardChoices[index]);
  }
  run.rewardChoices = null;
  advanceIfNoRewardLeft();
}

export function pickRewardRelic(id: string): void {
  const run = currentRun();
  if (!run.rewardRelicChoices) return;
  if (run.rewardRelicChoices.includes(id)) {
    addRelic(id);
  }
  run.rewardRelicChoices = null;
  advanceIfNoRewardLeft();
}

export function skipRemainingRewards(): void {
  const run = currentRun();
  run.rewardChoices = null;
  run.rewardRelicChoices = null;
  advanceIfNoRewardLeft();
}

function advanceIfNoRewardLeft(): void {
  const run = currentRun();
  if (run.rewardChoices || run.rewardRelicChoices) return;
  run.nodeIndex += 1;
  if (run.nodeIndex >= run.map.length) {
    run.screen = 'result';
    return;
  }
  run.screen = 'map';
}

export function addRelic(id: string): void {
  const run = currentRun();
  if (!RELIC_BY_ID[id] || run.relics.includes(id)) return;
  run.relics.push(id);
  if (id === 'knight-badge') {
    run.playerMaxHp += 5;
    run.playerHp += 5;
  }
}

/* ---------------- 事件 ---------------- */

export function availableEventOptions(): EventOption[] {
  const run = currentRun();
  const ev = run.eventDef;
  if (!ev) return [];
  const opts = ev.options.slice();
  if (hasRelic(run, 'old-map')) {
    opts.push({
      label: '【旧地图】绕道而行',
      hint: '恢复 4 点生命并获得 10 金币',
      effect: { heal: 4, gold: 10 },
    });
  }
  return opts;
}

export function resolveEventOption(index: number): void {
  const run = currentRun();
  const opts = availableEventOptions();
  const opt = opts[index];
  if (!opt) return;
  const e = opt.effect;
  const parts: string[] = [];

  if (e.heal) {
    const before = run.playerHp;
    run.playerHp = Math.min(run.playerMaxHp, run.playerHp + e.heal);
    parts.push(`恢复 ${run.playerHp - before} 点生命`);
  }
  if (e.maxHp) {
    run.playerMaxHp = Math.max(1, run.playerMaxHp + e.maxHp);
    if (e.maxHp > 0) run.playerHp += e.maxHp;
    else run.playerHp = Math.min(run.playerHp, run.playerMaxHp);
    parts.push(`最大生命 ${e.maxHp > 0 ? '+' : ''}${e.maxHp}`);
  }
  if (e.gold) {
    run.gold += e.gold;
    parts.push(`获得 ${e.gold} 金币`);
  }
  if (e.randomRelic) {
    const pool = unownedRelics(run);
    if (pool.length) {
      const relic = pick(pool);
      addRelic(relic.id);
      parts.push(`获得遗物【${relic.name}】`);
    } else {
      parts.push('没有可获得的遗物了');
    }
  }

  run.eventResult = parts.length ? parts.join('，') + '。' : '什么也没有发生。';

  if (e.removeCard) {
    run.pendingRemove = true;
    run.eventResult = '选择一张牌从牌组中永久移除。';
    return;
  }
  if (e.addCardChoices) {
    run.pendingCardChoices = pickMany(rewardPool(), 3);
    run.eventResult = '从下列卡牌中选择一张加入牌组。';
    return;
  }
}

export function removeCardById(cardId: string): void {
  const run = currentRun();
  const idx = run.deck.findIndex((c) => c.id === cardId);
  if (idx >= 0) {
    const [removed] = run.deck.splice(idx, 1);
    run.eventResult = `【${removed.name}】已被烧毁。`;
  }
  run.pendingRemove = false;
}

export function chooseEventCard(cardId: string): void {
  const run = currentRun();
  const card = run.pendingCardChoices?.find((c) => c.id === cardId);
  if (card) {
    run.deck.push(card);
    run.eventResult = `【${card.name}】加入了牌组。`;
  }
  run.pendingCardChoices = null;
}

export function leaveEvent(): void {
  const run = currentRun();
  run.eventDef = null;
  run.eventResult = null;
  run.pendingRemove = false;
  run.pendingCardChoices = null;
  run.nodeIndex += 1;
  if (run.nodeIndex >= run.map.length) {
    run.screen = 'result';
    return;
  }
  run.screen = 'map';
}

/* ---------------- 工具 ---------------- */

export function elapsedMs(run: RunState): number {
  return (run.endTime ?? Date.now()) - run.startTime;
}

export function nodeLabel(run: RunState, index: number): string {
  return NODE_META[run.map[index].kind].label;
}

export function deckCardById(id: string): CardDef | undefined {
  return CARD_BY_ID[id];
}

export function relicName(id: string): string {
  return RELIC_BY_ID[id]?.name ?? id;
}

export function bestNodeLabel(): string {
  const n = game.save.bestNode;
  return n > 0 ? `${n} 关` : '—';
}
