import './styles.css';
import { renderApp } from './ui/screens';
import * as state from './game/state';
import { cardCost, discardFromHand, endTurn, playCard } from './game/combat';
import type { BattleState, FxEvent, RunState } from './game/types';

const app = document.getElementById('app');
if (!app) throw new Error('缺少 #app 容器');

let helpOpen = false;
/** 特效播放中，暂时屏蔽输入 */
let busy = false;

/* ================= 特效层 ================= */

/** 独立于 #app 的特效层：重渲染不会打断进行中的动画 */
const fxLayer = document.createElement('div');
fxLayer.id = 'fx-layer';
document.body.appendChild(fxLayer);

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function anchor(selector: string, fallbackY = 0.4): { x: number; y: number } {
  const el = document.querySelector(selector);
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight * fallbackY };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.35 };
}

function spawnFloat(
  pos: { x: number; y: number },
  text: string,
  cls: string,
  delayMs = 0,
): void {
  const el = document.createElement('div');
  el.className = 'float-txt ' + cls;
  el.textContent = text;
  el.style.left = pos.x + 'px';
  el.style.top = pos.y + 'px';
  if (delayMs > 0) el.style.animationDelay = delayMs + 'ms';
  fxLayer.appendChild(el);
  setTimeout(() => el.remove(), 1150 + delayMs);
}

function addTempClass(selector: string, cls: string, ms: number, delayMs = 0): void {
  const el = document.querySelector(selector);
  if (!el) return;
  setTimeout(() => {
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }, delayMs);
}

async function showBanner(text: string, tone: string): Promise<void> {
  const el = document.createElement('div');
  el.className = 'fx-banner ' + tone;
  el.textContent = text;
  fxLayer.appendChild(el);
  await wait(780);
  el.remove();
}

function hurtFlash(): void {
  const el = document.createElement('div');
  el.className = 'hurt-vignette';
  fxLayer.appendChild(el);
  setTimeout(() => el.remove(), 520);
}

/** 底部轻提示（如“能量耗尽，自动结束回合”） */
function showToast(text: string): void {
  const el = document.createElement('div');
  el.className = 'fx-toast';
  el.textContent = text;
  fxLayer.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

/** 依次播放一队列特效 */
async function playFx(events: FxEvent[]): Promise<void> {
  if (!events.length) return;
  busy = true;
  document.body.classList.add('fx-busy');

  for (const ev of events) {
    switch (ev.kind) {
      case 'banner':
        await showBanner(ev.text, ev.tone);
        break;

      case 'enemy-hit': {
        addTempClass('.enemy-art', 'anim-hit', 420);
        const pos = anchor('.enemy-stage', 0.3);
        if (ev.real > 0) spawnFloat(pos, `-${ev.real}`, 'f-enemy-dmg');
        else spawnFloat(pos, '格挡', 'f-block');
        await wait(440);
        break;
      }

      case 'enemy-attack': {
        // 前摇 → 冲撞 → 结算飘字 → 回位
        addTempClass('.enemy-art', 'anim-lunge', 560);
        await wait(260);
        const pos = anchor('.player-zone', 0.5);
        if (ev.real > 0) {
          spawnFloat(pos, `-${ev.real}`, 'f-player-dmg');
          addTempClass('.screen-battle', 'anim-shake', 400);
          hurtFlash();
        } else {
          spawnFloat(pos, '格挡', 'f-block');
        }
        await wait(440);
        break;
      }

      case 'enemy-selfdamage': {
        addTempClass('.enemy-art', 'anim-hit', 380);
        spawnFloat(anchor('.enemy-stage', 0.3), `自伤 -${ev.value}`, 'f-enemy-dmg');
        await wait(400);
        break;
      }

      case 'enemy-defend': {
        addTempClass('.enemy-art', ev.failed ? 'anim-stagger' : 'anim-guard', 680);
        spawnFloat(
          anchor('.enemy-stage', 0.3),
          ev.failed ? '护甲失效！' : `+${ev.value} 护甲`,
          ev.failed ? 'f-good' : 'f-enemy-armor',
        );
        await wait(620);
        break;
      }

      case 'enemy-charge': {
        addTempClass('.enemy-art', 'anim-charge', 850);
        spawnFloat(anchor('.enemy-stage', 0.25), '蓄力！', 'f-charge');
        await wait(780);
        break;
      }

      case 'enemy-debuff': {
        spawnFloat(anchor('.enemy-stage', 0.3), `你的能量 -${ev.value}`, 'f-debuff');
        await wait(560);
        break;
      }

      case 'riposte': {
        addTempClass('.enemy-art', 'anim-hit', 380);
        spawnFloat(anchor('.enemy-stage', 0.3), `反击 -${ev.value}`, 'f-good');
        await wait(420);
        break;
      }

      case 'player-armor': {
        addTempClass('.p-armor', 'pulse-good', 520);
        spawnFloat(anchor('.p-armor', 0.5), `+${ev.value}`, 'f-armor');
        await wait(400);
        break;
      }

      case 'player-heal': {
        addTempClass('.p-hp', 'pulse-good', 520);
        spawnFloat(anchor('.p-hp', 0.5), `+${ev.value}`, 'f-heal');
        await wait(400);
        break;
      }

      case 'player-hurt':
        // 已在 enemy-attack 中处理
        break;
    }
  }

  busy = false;
  document.body.classList.remove('fx-busy');
}

function drainFx(): void {
  const s = state.game.run?.battle;
  if (!s || s.fx.length === 0) return;
  const events = s.fx.splice(0, s.fx.length);
  void playFx(events);
}

/* ================= 渲染与交互 ================= */

function render(): void {
  app!.innerHTML = renderApp(helpOpen);
  const log = document.getElementById('battle-log');
  if (log) log.scrollTop = log.scrollHeight;
  // 路线图：把当前节点平滑滚动到可视区中央（容器有固定宽高比，图片未加载也能算对位置）
  const sc = document.querySelector<HTMLElement>('.map-scroll');
  const node = document.querySelector<HTMLElement>('.path-node.current');
  if (sc && node) {
    const top = node.offsetTop - sc.clientHeight / 2 + node.offsetHeight / 2;
    sc.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}

/* ---------------- 自动结束回合 ---------------- */

/** 手牌里是否还有打得出去的牌 */
function hasPlayable(s: BattleState): boolean {
  return s.hand.some((c) => {
    if (cardCost(s, c.def) > s.energy) return false;
    if (s.cannotAttack && c.def.type === 'attack') return false;
    return true;
  });
}

/** 出完牌后一张能打的都不剩 → 提示后自动进入敌方回合 */
function autoEndTurnIfNeeded(): void {
  const s = state.game.run?.battle;
  if (!s || s.over || s.pendingDiscard > 0) return;
  if (hasPlayable(s)) return;

  showToast('⚡ 没有能出的牌，自动结束回合');
  void wait(750).then(() => {
    const run = state.game.run;
    const s2 = run?.battle;
    if (!run || !s2 || s2.over || s2.pendingDiscard > 0 || busy) return;
    if (hasPlayable(s2)) return; // 期间状态变了（例如特效给了能量）
    doEndTurn(run);
  });
}

/** 结束回合演出：手牌飞出 → 敌人行动特效 → 新回合 */
function doEndTurn(run: RunState): void {
  busy = true;
  document.body.classList.add('fx-busy');
  document
    .querySelectorAll('.hand-scroll .card')
    .forEach((c, i) => {
      c.classList.add('anim-discard');
      (c as HTMLElement).style.animationDelay = `${i * 30}ms`;
    });
  void wait(300).then(() => {
    endTurn(run.battle!, run);
    render();
    const events = run.battle ? run.battle.fx.splice(0, run.battle.fx.length) : [];
    busy = false;
    document.body.classList.remove('fx-busy');
    void playFx(events).then(() => autoEndTurnIfNeeded());
  });
}

app.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const el = target.closest<HTMLElement>('[data-action]');
  if (!el) return;

  // 帮助弹层：点盒子内部（非按钮）不关闭
  if (el.dataset.action === 'close-help' && el.classList.contains('overlay')) {
    if (target.closest('.help-box')) return;
  }

  if (busy) return;
  handleAction(el.dataset.action!, el);
});

function handleAction(action: string, el: HTMLElement): void {
  const run = state.game.run;

  switch (action) {
    case 'start':
      helpOpen = false;
      state.startNewRun();
      break;

    case 'help':
      helpOpen = true;
      break;

    case 'close-help':
      helpOpen = false;
      break;

    case 'abandon':
    case 'home':
      state.abandonRun();
      break;

    case 'enter-node':
      state.enterCurrentNode();
      break;

    case 'play-card': {
      if (!run?.battle) break;
      if (playCard(run.battle, run, Number(el.dataset.uid))) {
        render();
        const events = run.battle.fx.splice(0, run.battle.fx.length);
        void playFx(events).then(() => autoEndTurnIfNeeded());
        return;
      }
      break;
    }

    case 'discard-card': {
      if (!run?.battle) break;
      discardFromHand(run.battle, Number(el.dataset.uid));
      render();
      autoEndTurnIfNeeded();
      break;
    }

    case 'end-turn': {
      if (!run?.battle) break;
      doEndTurn(run);
      return;
    }

    case 'finish-battle':
      state.finishBattle();
      break;

    case 'pick-reward': {
      if (!run?.rewardChoices) break;
      const id = el.dataset.card;
      const idx = run.rewardChoices.findIndex((c) => c.id === id);
      state.pickRewardCard(idx);
      break;
    }

    case 'pick-relic': {
      const id = el.dataset.relic;
      if (id) state.pickRewardRelic(id);
      break;
    }

    case 'skip-reward':
      state.skipRemainingRewards();
      break;

    case 'event-option':
      state.resolveEventOption(Number(el.dataset.index));
      break;

    case 'remove-card': {
      const id = el.dataset.card;
      if (id) state.removeCardById(id);
      break;
    }

    case 'pick-event-card': {
      const id = el.dataset.card;
      if (id) state.chooseEventCard(id);
      break;
    }

    case 'leave-event':
      state.leaveEvent();
      break;

    case 'camp-heal':
      state.resolveCampHeal();
      break;

    case 'camp-remove':
      state.resolveCampRemove();
      break;

    case 'leave-camp':
      state.leaveCamp();
      break;

    default:
      return;
  }

  render();
  if (action === 'enter-node') drainFx(); // 进入战斗时播放"第 1 回合"横幅
}

render();
