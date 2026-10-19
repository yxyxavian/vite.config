/**
 * 逻辑层自动模拟：不依赖浏览器，用来回归验证战斗规则与单局流程。
 * 运行：npm run sim
 */
import type { RunState } from './types';
import { cardCost, currentIntent, discardFromHand, endTurn, playCard } from './combat';
import { setRng, seededRng } from './rng';
import {
  currentRun,
  enterCurrentNode,
  finishBattle,
  leaveCamp,
  leaveEvent,
  pickRewardCard,
  pickRewardRelic,
  removeCardById,
  chooseEventCard,
  resolveCampHeal,
  resolveEventOption,
  skipRemainingRewards,
  startNewRun,
} from './state';

/** 简单 AI：能打就打，优先攻击；能量不足或无可出牌则结束回合 */
function autoPlay(run: RunState): number {
  const s = run.battle;
  if (!s) return 0;
  let guard = 0;
  let turns = 0;

  while (!s.over && guard++ < 200) {
    if (s.pendingDiscard > 0) {
      const card = s.hand[0];
      if (!card) break;
      discardFromHand(s, card.uid);
      continue;
    }

    const playable = s.hand.filter(
      (c) => cardCost(s, c.def) <= s.energy && !(s.cannotAttack && c.def.type === 'attack'),
    );

    if (playable.length === 0) {
      if (!endTurn(s, run)) break;
      turns += 1;
      continue;
    }

    const intent = currentIntent(s);
    const incoming = intent.kind === 'attack' ? intent.value : 0;
    const hpRatio = run.playerHp / run.playerMaxHp;

    let choice = undefined as (typeof playable)[number] | undefined;

    // 1) 血量偏低先治疗
    if (hpRatio < 0.45) {
      choice = playable.find((c) => c.def.id === 'heal');
    }

    // 2) 面对攻击且护甲不足时先垫护甲
    if (!choice && incoming > 0 && s.playerArmor < incoming && (incoming >= 6 || hpRatio < 0.6)) {
      const defense = playable
        .filter((c) => c.def.type === 'defense' && c.def.id !== 'hold-line')
        .sort((a, b) => b.def.cost - a.def.cost);
      if (defense.length) choice = defense[0];
    }

    // 3) 打伤害：优先高费（数值更高）
    if (!choice) {
      const attacks = playable
        .filter((c) => c.def.type === 'attack')
        .sort((a, b) => b.def.cost - a.def.cost);
      if (attacks.length) choice = attacks[0];
    }

    // 4) 功能牌，最后随便
    if (!choice) choice = playable.find((c) => c.def.type === 'utility');
    if (!choice) choice = playable[0];

    if (!playCard(s, run, choice.uid)) break;
  }

  if (!s.over) endTurn(s, run);
  return turns;
}

function runOneGame(seed: number): { win: boolean; nodes: number; mapLen: number; turns: number; hp: number } {
  setRng(seededRng(seed));
  const run = startNewRun();
  let turns = 0;
  let guard = 0;

  while (run.screen !== 'result' && guard++ < 500) {
    switch (run.screen) {
      case 'map':
        enterCurrentNode();
        break;
      case 'battle':
        turns += autoPlay(run);
        finishBattle();
        break;
      case 'reward': {
        if (run.rewardChoices) {
          pickRewardCard(0);
        } else if (run.rewardRelicChoices) {
          pickRewardRelic(run.rewardRelicChoices[0]);
        } else {
          skipRemainingRewards();
        }
        break;
      }
      case 'event': {
        if (run.pendingRemove) {
          if (run.deck.length > 1) removeCardById(run.deck[0].id);
          else run.pendingRemove = false;
          leaveEvent();
        } else if (run.pendingCardChoices) {
          chooseEventCard(run.pendingCardChoices[0].id);
          leaveEvent();
        } else if (run.eventResult) {
          leaveEvent();
        } else {
          resolveEventOption(0);
        }
        break;
      }
      case 'camp': {
        if (run.pendingRemove) {
          if (run.deck.length > 1) removeCardById(run.deck[0].id);
          else run.pendingRemove = false;
          leaveCamp();
        } else if (run.eventResult) {
          leaveCamp();
        } else {
          resolveCampHeal();
        }
        break;
      }
      default:
        break;
    }
  }

  return {
    win: run.result === 'win',
    nodes: run.nodeIndex + 1,
    mapLen: run.map.length,
    turns,
    hp: run.playerHp,
  };
}

const results = [];
for (let i = 1; i <= 30; i++) {
  results.push(runOneGame(i * 7919));
}

const wins = results.filter((r) => r.win).length;
const avgTurns = results.reduce((a, r) => a + r.turns, 0) / results.length;
const avgNodes = results.reduce((a, r) => a + r.nodes, 0) / results.length;
const avgMapLen = results.reduce((a, r) => a + r.mapLen, 0) / results.length;

console.log(`模拟 ${results.length} 局（种子固定，可复现）`);
console.log(`通关率: ${((wins / results.length) * 100).toFixed(1)}%  (${wins}/${results.length})`);
console.log(`平均战斗回合数: ${avgTurns.toFixed(1)}`);
console.log(`平均路线长度: ${avgMapLen.toFixed(1)} 节点`);
console.log(`平均到达节点: ${avgNodes.toFixed(2)}`);
console.log('明细:');
results.forEach((r, i) => {
  console.log(
    `  #${String(i + 1).padStart(2, '0')} ${r.win ? '通关' : '失败'}  路线 ${r.mapLen} 节点  走到 ${r.nodes}  回合 ${r.turns}  剩余生命 ${r.hp}`,
  );
});

// 冒烟断言：任何一局都不能卡死（nodes 必须 >=1）
const stuck = results.some((r) => r.nodes < 1);
if (stuck) {
  throw new Error('检测到异常：有对局未能推进');
}
console.log('\n流程推进正常，无卡死。');
