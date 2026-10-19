import type { CardDef } from '../game/types';
import { currentIntent, hasRelic } from '../game/combat';
import { computeMapLayout } from './mapBg';
import { RELIC_BY_ID } from '../game/relics';
import { formatTime } from '../game/save';
import {
  bestNodeLabel,
  elapsedMs,
  game,
  availableEventOptions,
  campHealAmount,
  currentRun,
  hasRun,
} from '../game/state';
import {
  esc,
  handCardHTML,
  bigCardHTML,
  hpBarHTML,
  intentHTML,
  logHTML,
  relicStripHTML,
  TYPE_CLASS,
} from './render';

const BASE: string = ((import.meta as any).env?.BASE_URL as string) ?? '/';
const UI = BASE + 'assets/ui/';

/* ---------------- 开始页 ---------------- */

function startScreen(): string {
  const s = game.save;
  return `
  <div class="screen screen-start">
    <img class="bg" src="${UI}ui-bg-start.webp" alt="" />
    <div class="start-inner">
      <div class="title-block">
        <h1 class="game-title">骑士试炼</h1>
        <p class="game-sub">随机长征 · 30~50 关</p>
      </div>
      <button class="btn btn-primary btn-lg" data-action="start">开始试炼</button>
      <div class="stat-grid">
        <div class="stat"><b>${bestNodeLabel()}</b><span>最远节点</span></div>
        <div class="stat"><b>${s.wins}</b><span>胜场</span></div>
        <div class="stat"><b>${s.runs}</b><span>局数</span></div>
        <div class="stat"><b>${formatTime(s.bestTimeMs)}</b><span>最佳用时</span></div>
      </div>
      <button class="btn btn-ghost" data-action="help">玩法说明</button>
    </div>
  </div>`;
}

/* ---------------- 路线页 ---------------- */

function mapScreen(): string {
  const run = currentRun();
  const idx = Math.min(run.nodeIndex, run.map.length - 1);
  const N = run.map.length;
  // 整张地图布局：一条连续蜿蜒的路，圆点坐标由 mapBg 统一给出（无接缝）
  const L = computeMapLayout(N);

  const nodes = run.map
    .map((n, i) => {
      const p = L.points[i];
      const done = i < idx;
      const current = i === idx;
      const isLast = i === N - 1;
      return `
      <div class="path-node ${n.kind} ${done ? 'done' : ''} ${current ? 'current' : ''}"
           style="left:${((p.x / L.w) * 100).toFixed(2)}%;top:${((p.y / L.h) * 100).toFixed(2)}%"
           ${current ? 'data-action="enter-node"' : 'aria-hidden="true"'}>
        <span class="path-icon">${done ? '✓' : n.icon}</span>
        ${current ? '<span class="path-now">▼ 当前</span>' : ''}
        ${isLast && !done ? '<span class="path-king">👑</span>' : ''}
      </div>`;
    })
    .join('');

  return `
  <div class="screen screen-map">
    <div class="map-inner">
      <header class="top-bar">
        <span class="node-tag">节点 ${idx + 1} / ${N}</span>
        <span class="hp-inline">❤️ ${run.playerHp} / ${run.playerMaxHp}</span>
        <span class="gold-inline">🪙 ${run.gold}</span>
      </header>
      ${relicStripHTML(run.relics)}
      <div class="map-scroll">
        <div class="path-track" style="aspect-ratio:${L.w} / ${L.h};">
          <img class="map-img" src="${UI}ui-map-long.webp" alt="" />
          ${nodes}
          <div class="path-castle-tag">堕落骑士的城堡 👑</div>
          <div class="path-start">起点 · 出发！</div>
        </div>
      </div>
      <div class="map-foot">
        <button class="btn btn-primary btn-lg" data-action="enter-node">进入节点</button>
        <button class="btn btn-ghost btn-sm" data-action="abandon">放弃本局</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- 战斗页 ---------------- */

function battleScreen(): string {
  const run = currentRun();
  const s = run.battle;
  if (!s) return '';
  const intent = currentIntent(s);
  const discardMode = s.pendingDiscard > 0;
  const playerDead = run.playerHp <= 0;
  const enemyDead = s.enemyHp <= 0;

  const hand = s.hand
    .map((c) => handCardHTML(c, s, discardMode))
    .join('');

  const overlay = s.over
    ? `<div class="battle-over">
        <div class="battle-over-box">
          <div class="battle-over-title">${playerDead ? '你倒下了' : '战斗胜利'}</div>
          <p>${playerDead ? '这一局到此为止。' : `击败了 ${esc(s.enemyDef.name)}。`}</p>
          <button class="btn btn-primary" data-action="finish-battle">继续</button>
        </div>
      </div>`
    : '';

  return `
  <div class="screen screen-battle">
    <img class="bg bg-battle" src="${UI}ui-bg-battle.webp" alt="" />
    <div class="battle-inner">
      <header class="top-bar">
        <span class="node-tag">节点 ${run.nodeIndex + 1} / ${run.map.length}</span>
        <span class="turn-tag">第 ${s.turn} 回合</span>
        <span class="hp-inline">❤️ ${run.playerHp}</span>
      </header>

      <section class="enemy-zone">
        <div class="enemy-head">
          <span class="enemy-name">${esc(s.enemyDef.name)}</span>
          ${s.enemyArmor > 0 ? `<span class="armor-chip">🛡️ ${s.enemyArmor}</span>` : ''}
        </div>
        ${hpBarHTML(s.enemyHp, s.enemyMaxHp, 'enemy')}
        <div class="enemy-stage">
          <img class="enemy-art" src="${s.enemyDef.art}" alt="${esc(s.enemyDef.name)}" />
          ${intentHTML(intent)}
        </div>
      </section>

      <section class="player-zone">
        <div class="ps p-hp">❤️ ${run.playerHp} / ${run.playerMaxHp}</div>
        <div class="ps p-armor">🛡️ ${s.playerArmor}</div>
        <div class="ps p-energy">⚡ ${s.energy} / ${s.maxEnergy}</div>
      </section>

      <section class="log-box">
        <div class="log-inner" id="battle-log">${logHTML(s.log)}</div>
      </section>

      ${discardMode ? '<div class="hint-bar">请选择一张牌弃掉（' + s.pendingDiscard + '）</div>' : ''}
      ${s.cannotAttack ? '<div class="hint-bar">坚守中：本回合无法攻击</div>' : ''}

      <section class="hand-zone">
        <div class="hand-scroll">${hand}</div>
      </section>

      <footer class="battle-foot">
        <div class="piles">
          <span>牌库 ${s.drawPile.length}</span>
          <span>弃牌 ${s.discardPile.length}</span>
        </div>
        <button class="btn btn-primary end-turn" data-action="end-turn" ${s.over || discardMode ? 'disabled' : ''}>
          结束回合
        </button>
      </footer>

      ${overlay}
    </div>
  </div>`;
}

/* ---------------- 奖励页 ---------------- */

function rewardScreen(): string {
  const run = currentRun();

  if (run.rewardChoices) {
    return `
    <div class="screen screen-reward">
      <div class="panel">
        <h2 class="panel-title">战斗胜利</h2>
        <p class="panel-sub">选择一张牌加入牌组</p>
        <div class="reward-row">
          ${run.rewardChoices.map((c) => bigCardHTML(c, 'pick-reward')).join('')}
        </div>
        <button class="btn btn-ghost" data-action="skip-reward">跳过</button>
      </div>
    </div>`;
  }

  if (run.rewardRelicChoices) {
    const relics = run.rewardRelicChoices
      .map((id) => {
        const r = RELIC_BY_ID[id];
        if (!r) return '';
        return `<button class="relic-pick" data-action="pick-relic" data-relic="${id}">
            <img src="${r.art}" alt="${esc(r.name)}" />
            <b>${esc(r.name)}</b>
            <span>${esc(r.desc)}</span>
          </button>`;
      })
      .join('');
    return `
    <div class="screen screen-reward">
      <div class="panel">
        <h2 class="panel-title">精英战利品</h2>
        <p class="panel-sub">选择一个遗物</p>
        <div class="relic-row">${relics}</div>
        <button class="btn btn-ghost" data-action="skip-reward">不要了</button>
      </div>
    </div>`;
  }

  return '';
}

/* ---------------- 事件页 ---------------- */

/** 牌组选牌删除的共用 UI（事件 / 休营地） */
function deckPickHTML(): string {
  const run = currentRun();
  const counts = new Map<string, { def: CardDef; n: number }>();
  for (const c of run.deck) {
    const cur = counts.get(c.id);
    if (cur) cur.n += 1;
    else counts.set(c.id, { def: c, n: 1 });
  }
  const chips = [...counts.values()]
    .map(
      ({ def, n }) =>
        `<button class="deck-chip ${TYPE_CLASS[def.type]}" data-action="remove-card" data-card="${def.id}">
            ${esc(def.name)}${n > 1 ? ` ×${n}` : ''}
          </button>`,
    )
    .join('');
  return `<div class="deck-pick">${chips}</div>`;
}

function eventScreen(): string {
  const run = currentRun();
  const ev = run.eventDef;
  if (!ev) return '';

  let body = '';

  if (run.pendingRemove) {
    body = deckPickHTML();
  } else if (run.pendingCardChoices) {
    body = `<div class="reward-row">${run.pendingCardChoices
      .map((c) => bigCardHTML(c, 'pick-event-card'))
      .join('')}</div>`;
  } else if (run.eventResult) {
    body = `
      <p class="event-result">${esc(run.eventResult)}</p>
      <button class="btn btn-primary" data-action="leave-event">继续前进</button>`;
  } else {
    const opts = availableEventOptions();
    body = `<div class="option-list">${opts
      .map(
        (o, i) => `
        <button class="option" data-action="event-option" data-index="${i}">
          <b>${esc(o.label)}</b>
          ${o.hint ? `<span>${esc(o.hint)}</span>` : ''}
        </button>`,
      )
      .join('')}</div>`;
  }

  return `
  <div class="screen screen-event">
    <div class="panel event-panel">
      <div class="event-icon">❓</div>
      <h2 class="panel-title">${esc(ev.name)}</h2>
      <p class="event-text">${esc(ev.text)}</p>
      ${body}
    </div>
  </div>`;
}

/* ---------------- 休营地页 ---------------- */

function campScreen(): string {
  const run = currentRun();

  let body = '';
  if (run.pendingRemove) {
    body = `<p class="event-text">选择一张牌，把它熔进篝火里。</p>${deckPickHTML()}`;
  } else if (run.eventResult) {
    body = `
      <p class="event-result">${esc(run.eventResult)}</p>
      <button class="btn btn-primary" data-action="leave-camp">继续前进</button>`;
  } else {
    body = `
      <div class="option-list">
        <button class="option" data-action="camp-heal">
          <b>⛺ 篝火休整</b>
          <span>恢复 ${campHealAmount(run)} 点生命</span>
        </button>
        <button class="option" data-action="camp-remove">
          <b>🔥 打磨装备</b>
          <span>从牌组中永久移除一张牌</span>
        </button>
      </div>`;
  }

  return `
  <div class="screen screen-event">
    <div class="panel event-panel">
      <div class="event-icon">⛺</div>
      <h2 class="panel-title">休营地</h2>
      <p class="event-text">漫长的征途中难得的喘息。篝火噼啪作响，趁夜色未深，做点修整吧。</p>
      ${body}
    </div>
  </div>`;
}

/* ---------------- 结算页 ---------------- */

function deckSummary(deck: CardDef[]): string {
  const counts = new Map<string, { def: CardDef; n: number }>();
  for (const c of deck) {
    const cur = counts.get(c.id);
    if (cur) cur.n += 1;
    else counts.set(c.id, { def: c, n: 1 });
  }
  return [...counts.values()]
    .map(
      ({ def, n }) =>
        `<span class="deck-chip ${TYPE_CLASS[def.type]}">${esc(def.name)}${n > 1 ? ` ×${n}` : ''}</span>`,
    )
    .join('');
}

function resultScreen(): string {
  const run = currentRun();
  const win = run.result === 'win';
  const time = elapsedMs(run);
  const reached = win ? run.map.length : run.nodeIndex + 1;

  return `
  <div class="screen screen-result ${win ? 'is-win' : 'is-lose'}">
    <div class="panel result-panel">
      <div class="result-badge">${win ? '👑' : '💀'}</div>
      <h2 class="panel-title">${win ? '通关！' : '试炼失败'}</h2>
      <p class="panel-sub">${win ? '你击败了堕落骑士，试炼完成。' : '倒在了第 ' + reached + ' 个节点。'}</p>

      <div class="result-stats">
        <div class="stat"><b>${reached} / ${run.map.length}</b><span>到达节点</span></div>
        <div class="stat"><b>${formatTime(time)}</b><span>用时</span></div>
        <div class="stat"><b>${run.gold}</b><span>金币</span></div>
      </div>

      ${
        run.relics.length
          ? `<div class="result-block"><h3>遗物</h3><div class="relic-strip">${run.relics
              .map((id) => {
                const r = RELIC_BY_ID[id];
                return r ? `<div class="relic" title="${esc(r.desc)}"><img src="${r.art}" alt="${esc(r.name)}" /></div>` : '';
              })
              .join('')}</div></div>`
          : ''
      }

      <div class="result-block">
        <h3>本局牌组（${run.deck.length} 张）</h3>
        <div class="chip-wrap">${deckSummary(run.deck)}</div>
      </div>

      <div class="result-actions">
        <button class="btn btn-primary btn-lg" data-action="start">再来一局</button>
        <button class="btn btn-ghost" data-action="home">返回首页</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- 说明弹层 ---------------- */

function helpOverlay(): string {
  return `
  <div class="overlay" data-action="close-help">
    <div class="help-box" data-stop="1">
      <h2>玩法说明</h2>
      <ul>
        <li>每局路线随机生成 30~50 个节点：普通战斗、精英战、事件、休营地穿插，终点是 Boss 堕落骑士。</li>
        <li>越往后敌人越强：前段是杂兵，中段出现骷髅、幽灵，后段有食人魔、幼龙等强敌。</li>
        <li>休营地可以恢复 30% 生命或删除一张牌，长旅程里别错过。</li>
        <li>每回合抽 5 张牌，拥有 3 点能量，手牌上限 7 张。</li>
        <li>护甲会在你的回合开始时清空，用来抵挡敌人本回合的攻击。</li>
        <li>敌人头顶会提前显示它下回合的行动，据此决定攻守。</li>
        <li>战斗胜利后可三选一拿一张新牌，也可以跳过。</li>
        <li>生命归零即本局结束；刷新页面视为放弃本局。</li>
        <li>最远节点、胜场、局数会保存在本机浏览器中。</li>
      </ul>
      <button class="btn btn-primary" data-action="close-help">知道了</button>
    </div>
  </div>`;
}

/* ---------------- 总入口 ---------------- */

export function renderApp(helpOpen: boolean): string {
  let screen = '';
  if (!hasRun() || !game.run) {
    screen = startScreen();
  } else {
    switch (game.run.screen) {
      case 'map':
        screen = mapScreen();
        break;
      case 'battle':
        screen = battleScreen();
        break;
      case 'reward':
        screen = rewardScreen() || mapScreen();
        break;
      case 'event':
        screen = eventScreen();
        break;
      case 'camp':
        screen = campScreen();
        break;
      case 'result':
        screen = resultScreen();
        break;
      default:
        screen = startScreen();
    }
  }
  return `<div class="app">${screen}${helpOpen ? helpOverlay() : ''}</div>`;
}
