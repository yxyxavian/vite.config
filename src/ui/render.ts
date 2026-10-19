import type { BattleState, CardDef, CardInstance, Intent, LogEntry } from '../game/types';
import { cardCost, intentIcon, intentText } from '../game/combat';
import { RELIC_BY_ID } from '../game/relics';

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const TYPE_CLASS: Record<string, string> = {
  attack: 't-attack',
  defense: 't-defense',
  utility: 't-utility',
};

/** 战斗中的手牌 */
export function handCardHTML(inst: CardInstance, s: BattleState, discardMode: boolean): string {
  const def = inst.def;
  const cost = cardCost(s, def);
  const disabled = discardMode ? false : cost > s.energy || (s.cannotAttack && def.type === 'attack');
  const action = discardMode ? 'discard-card' : 'play-card';
  return `
    <button class="card ${TYPE_CLASS[def.type]} ${disabled ? 'is-disabled' : ''}" 
            data-action="${action}" data-uid="${inst.uid}">
      <span class="card-cost">${cost}</span>
      <span class="card-art"><img src="${def.art}" alt="" loading="lazy" /></span>
      <span class="card-name">${esc(def.name)}</span>
      <span class="card-desc">${esc(def.desc)}</span>
    </button>`;
}

/** 奖励页 / 事件页的大卡 */
export function bigCardHTML(def: CardDef, action: string): string {
  return `
    <button class="card card-big ${TYPE_CLASS[def.type]}" data-action="${action}" data-card="${def.id}">
      <span class="card-cost">${def.cost}</span>
      <span class="card-art"><img src="${def.art}" alt="" /></span>
      <span class="card-name">${esc(def.name)}</span>
      <span class="card-desc">${esc(def.desc)}</span>
    </button>`;
}

export function hpBarHTML(cur: number, max: number, variant: 'player' | 'enemy' = 'player'): string {
  const pct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
  return `
    <div class="hp-bar ${variant}">
      <div class="hp-fill" style="width:${pct}%"></div>
      <span class="hp-text">${cur} / ${max}</span>
    </div>`;
}

export function intentHTML(intent: Intent): string {
  return `<div class="intent intent-${intent.kind}">
      <span class="intent-icon">${intentIcon(intent)}</span>
      <span class="intent-text">${esc(intentText(intent))}</span>
    </div>`;
}

export function relicStripHTML(relics: string[]): string {
  if (!relics.length) return '';
  const items = relics
    .map((id) => {
      const r = RELIC_BY_ID[id];
      if (!r) return '';
      return `<div class="relic" title="${esc(r.name)}：${esc(r.desc)}">
          <img src="${r.art}" alt="${esc(r.name)}" />
        </div>`;
    })
    .join('');
  return `<div class="relic-strip">${items}</div>`;
}

export function logHTML(log: LogEntry[]): string {
  const recent = log.slice(-8);
  return recent
    .map((e) => `<div class="log-line log-${e.kind}">${esc(e.text)}</div>`)
    .join('');
}

export function energyPipsHTML(energy: number, max: number): string {
  let pips = '';
  const total = Math.max(max, energy);
  for (let i = 0; i < total; i++) {
    pips += `<span class="pip ${i < energy ? 'on' : 'off'}"></span>`;
  }
  return `<div class="energy-pips">${pips}</div>`;
}
