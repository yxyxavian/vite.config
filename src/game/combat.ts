import type {
  BattleState,
  CardDef,
  CardInstance,
  CardRuntime,
  EnemyDef,
  FxEvent,
  Intent,
  LogEntry,
  RunState,
} from './types';
import { shuffle } from './rng';

const HAND_LIMIT = 7;
const BASE_ENERGY = 3;

let uidSeq = 1;

function pushLog(s: BattleState, text: string, kind: LogEntry['kind'] = 'system'): void {
  s.log.push({ text, kind });
  if (s.log.length > 60) s.log.splice(0, s.log.length - 60);
}

function pushFx(s: BattleState, event: FxEvent): void {
  s.fx.push(event);
}

export function hasRelic(run: RunState, id: string): boolean {
  return run.relics.includes(id);
}

/** 当前显示给玩家的敌人意图 */
export function currentIntent(s: BattleState): Intent {
  const p = s.enemyDef.pattern;
  return p[s.intentIndex % p.length];
}

export function intentText(intent: Intent): string {
  switch (intent.kind) {
    case 'attack':
      return intent.selfDamage
        ? `自伤 ${intent.selfDamage} · 攻击 ${intent.value}`
        : `攻击 ${intent.value}`;
    case 'defend':
      return `防御 ${intent.value}`;
    case 'charge':
      return '蓄力';
    case 'debuff':
      return intent.label;
    default:
      return '';
  }
}

export function intentIcon(intent: Intent): string {
  switch (intent.kind) {
    case 'attack':
      return '⚔️';
    case 'defend':
      return '🛡️';
    case 'charge':
      return '✨';
    case 'debuff':
      return '🌀';
    default:
      return '❔';
  }
}

/** 计算某张牌当前的实际费用（含号令 / 战旗减免） */
export function cardCost(s: BattleState, def: CardDef): number {
  let cost = def.cost;
  if (def.type === 'attack' && s.firstAttackDiscount) cost -= 1;
  if (def.type === 'defense' && s.firstDefenseDiscount) cost -= 1;
  return Math.max(0, cost);
}

function drawCards(s: BattleState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (s.hand.length >= HAND_LIMIT) {
      pushLog(s, '手牌已满（上限 7 张）。');
      return;
    }
    if (s.drawPile.length === 0) {
      if (s.discardPile.length === 0) {
        pushLog(s, '牌堆与弃牌堆都已空，无牌可抽。');
        return;
      }
      s.drawPile = shuffle(s.discardPile);
      s.discardPile = [];
      pushLog(s, '弃牌堆重新洗入牌库。');
    }
    const card = s.drawPile.pop();
    if (card) s.hand.push(card);
  }
}

export function createBattle(enemy: EnemyDef, run: RunState): BattleState {
  const pile: CardInstance[] = run.deck.map((def) => ({ uid: uidSeq++, def }));
  const s: BattleState = {
    enemyDef: enemy,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.hp,
    enemyArmor: 0,
    intentIndex: 0,
    turn: 0,
    energy: BASE_ENERGY,
    maxEnergy: BASE_ENERGY,
    playerArmor: 0,
    drawPile: shuffle(pile),
    hand: [],
    discardPile: [],
    cardsPlayed: 0,
    defensePlayed: false,
    attackUsedThisTurn: false,
    dmgBonus: 0,
    firstAttackDiscount: false,
    firstDefenseDiscount: false,
    cannotAttack: false,
    riposte: 0,
    enemyArmorDisabled: false,
    firstAttackDone: false,
    energyPenalty: 0,
    pendingDiscard: 0,
    over: false,
    log: [],
    fx: [],
  };
  pushLog(s, `遭遇 ${enemy.name}（${enemy.hp} 点生命）。`, 'system');
  startPlayerTurn(s, run);
  return s;
}

export function startPlayerTurn(s: BattleState, run: RunState): void {
  if (s.over) return;

  s.turn += 1;
  s.playerArmor = 0;
  s.cardsPlayed = 0;
  s.defensePlayed = false;
  s.attackUsedThisTurn = false;
  s.dmgBonus = 0;
  s.firstAttackDiscount = false;
  s.cannotAttack = false;
  s.riposte = 0;

  // 战旗：每回合第一张防御牌费用 -1
  s.firstDefenseDiscount = hasRelic(run, 'war-banner');

  // 法师削弱：本回合能量减少
  const penalty = s.energyPenalty;
  s.energyPenalty = 0;
  s.energy = Math.max(0, s.maxEnergy - penalty);
  if (penalty > 0) pushLog(s, `你被削弱，本回合少 ${penalty} 点能量。`, 'bad');

  // 铁盾：第一回合 +3 护甲
  if (s.turn === 1 && hasRelic(run, 'iron-shield')) {
    s.playerArmor += 3;
    pushLog(s, '【铁盾】开局获得 3 点护甲。', 'good');
  }

  // 抽牌
  let drawCount = 5;
  if (s.turn === 1 && hasRelic(run, 'torch')) {
    drawCount += 1;
    pushLog(s, '【火把】开局多抽 1 张牌。', 'good');
  }
  drawCards(s, drawCount);

  pushFx(s, { kind: 'banner', text: `第 ${s.turn} 回合`, tone: 'player' });
  pushLog(s, `—— 第 ${s.turn} 回合 ——`, 'system');
}

interface RuntimeHooks {
  requestDiscard: (n: number) => void;
}

function makeRuntime(s: BattleState, run: RunState, hooks: RuntimeHooks): CardRuntime {
  const player: CardRuntime['player'] = {
    get hp() {
      return run.playerHp;
    },
    set hp(v: number) {
      run.playerHp = Math.max(0, Math.min(run.playerMaxHp, v));
    },
    get maxHp() {
      return run.playerMaxHp;
    },
    set maxHp(v: number) {
      run.playerMaxHp = v;
    },
    get armor() {
      return s.playerArmor;
    },
    set armor(v: number) {
      s.playerArmor = Math.max(0, v);
    },
    get energy() {
      return s.energy;
    },
    set energy(v: number) {
      s.energy = v;
    },
  };

  const enemy: CardRuntime['enemy'] = {
    get hp() {
      return s.enemyHp;
    },
    set hp(v: number) {
      s.enemyHp = v;
    },
    get maxHp() {
      return s.enemyMaxHp;
    },
    get armor() {
      return s.enemyArmor;
    },
    set armor(v: number) {
      s.enemyArmor = Math.max(0, v);
    },
  };

  const rt: CardRuntime = {
    player,
    enemy,
    dealDamage(amount: number, opts?: { ignoreArmor?: boolean }) {
      if (amount <= 0) {
        pushLog(s, '没有造成伤害。');
        return;
      }
      const total = amount + s.dmgBonus;
      if (opts?.ignoreArmor) {
        s.enemyHp -= total;
        pushFx(s, { kind: 'enemy-hit', total, absorbed: 0, real: total });
        pushLog(s, `造成 ${total} 点伤害（无视护甲）。`, 'player');
      } else {
        const absorbed = Math.min(s.enemyArmor, total);
        if (absorbed > 0) s.enemyArmor -= absorbed;
        const real = total - absorbed;
        s.enemyHp -= real;
        pushFx(s, { kind: 'enemy-hit', total, absorbed, real });
        pushLog(
          s,
          absorbed > 0
            ? `造成 ${total} 点伤害（护甲抵挡 ${absorbed}，实际 ${real}）。`
            : `造成 ${total} 点伤害。`,
          'player',
        );
      }
    },
    gainArmor(amount: number) {
      if (amount <= 0) return;
      s.playerArmor += amount;
      pushFx(s, { kind: 'player-armor', value: amount });
      pushLog(s, `获得 ${amount} 点护甲（当前 ${s.playerArmor}）。`, 'good');
    },
    heal(amount: number) {
      const before = run.playerHp;
      run.playerHp = Math.min(run.playerMaxHp, run.playerHp + amount);
      const healed = run.playerHp - before;
      if (healed > 0) pushFx(s, { kind: 'player-heal', value: healed });
      pushLog(s, `恢复 ${healed} 点生命。`, 'good');
    },
    draw(count: number) {
      drawCards(s, count);
    },
    gainEnergy(amount: number) {
      s.energy += amount;
      pushLog(s, `获得 ${amount} 点能量。`, 'good');
    },
    requestDiscard(count: number) {
      hooks.requestDiscard(count);
    },
    get enemyArmorDisabled() {
      return s.enemyArmorDisabled;
    },
    set enemyArmorDisabled(v: boolean) {
      s.enemyArmorDisabled = v;
    },
    get dmgBonus() {
      return s.dmgBonus;
    },
    set dmgBonus(v: number) {
      s.dmgBonus = v;
    },
    get cardsPlayed() {
      return s.cardsPlayed;
    },
    set cardsPlayed(v: number) {
      s.cardsPlayed = v;
    },
    get defensePlayed() {
      return s.defensePlayed;
    },
    set defensePlayed(v: boolean) {
      s.defensePlayed = v;
    },
    get cannotAttack() {
      return s.cannotAttack;
    },
    set cannotAttack(v: boolean) {
      s.cannotAttack = v;
    },
    get riposte() {
      return s.riposte;
    },
    set riposte(v: number) {
      s.riposte = v;
    },
    get firstAttackDiscount() {
      return s.firstAttackDiscount;
    },
    set firstAttackDiscount(v: boolean) {
      s.firstAttackDiscount = v;
    },
    say(text: string) {
      pushLog(s, text, 'system');
    },
  };

  return rt;
}

export function playCard(s: BattleState, run: RunState, uid: number): boolean {
  if (s.over) return false;

  const idx = s.hand.findIndex((c) => c.uid === uid);
  if (idx < 0) return false;

  const card = s.hand[idx];
  const def = card.def;

  if (s.cannotAttack && def.type === 'attack') {
    pushLog(s, '你正在坚守，本回合无法攻击。', 'bad');
    return false;
  }

  const cost = cardCost(s, def);
  if (s.energy < cost) {
    pushLog(s, '能量不足。', 'bad');
    return false;
  }

  s.energy -= cost;

  // 消耗费用减免
  if (def.type === 'attack' && s.firstAttackDiscount) s.firstAttackDiscount = false;
  if (def.type === 'defense' && s.firstDefenseDiscount) s.firstDefenseDiscount = false;

  s.hand.splice(idx, 1);

  // 遗物临时增伤
  let relicBonus = 0;
  if (def.type === 'attack') {
    if (hasRelic(run, 'whetstone') && !s.firstAttackDone) {
      relicBonus += 2;
      s.firstAttackDone = true;
      pushLog(s, '【磨刀石】本场第一张攻击牌 +2 伤害。', 'good');
    }
    if (hasRelic(run, 'bracer') && !s.attackUsedThisTurn) {
      relicBonus += 1;
      s.attackUsedThisTurn = true;
      pushLog(s, '【护腕】本回合首次攻击 +1 伤害。', 'good');
    }
  }
  s.dmgBonus += relicBonus;

  pushLog(s, `你打出【${def.name}】。`, 'player');

  const rt = makeRuntime(s, run, {
    requestDiscard: (n) => {
      s.pendingDiscard += n;
      pushLog(s, `需要弃掉 ${n} 张牌。`, 'system');
    },
  });
  def.play(rt);

  s.dmgBonus -= relicBonus;

  s.cardsPlayed += 1;
  if (def.type === 'defense') s.defensePlayed = true;

  s.discardPile.push(card);

  checkEnd(s, run);
  return true;
}

export function discardFromHand(s: BattleState, uid: number): boolean {
  if (s.pendingDiscard <= 0) return false;
  const idx = s.hand.findIndex((c) => c.uid === uid);
  if (idx < 0) return false;
  const [card] = s.hand.splice(idx, 1);
  s.discardPile.push(card);
  s.pendingDiscard -= 1;
  pushLog(s, `弃掉【${card.def.name}】。`, 'system');
  return true;
}

function enemyAct(s: BattleState, run: RunState): void {
  const intent = currentIntent(s);

  pushFx(s, { kind: 'banner', text: '敌方回合', tone: 'enemy' });

  // 敌人护甲在自己的回合开始时清空
  s.enemyArmor = 0;

  switch (intent.kind) {
    case 'attack': {
      if (intent.selfDamage) {
        s.enemyHp -= intent.selfDamage;
        pushFx(s, { kind: 'enemy-selfdamage', value: intent.selfDamage });
        pushLog(s, `${s.enemyDef.name} 自伤 ${intent.selfDamage} 点。`, 'enemy');
      }
      const raw = intent.value;
      const absorbed = Math.min(s.playerArmor, raw);
      s.playerArmor -= absorbed;
      const real = raw - absorbed;
      run.playerHp = Math.max(0, run.playerHp - real);
      pushFx(s, { kind: 'enemy-attack', value: raw, absorbed, real });
      if (real > 0) pushFx(s, { kind: 'player-hurt', real });
      pushLog(
        s,
        `${s.enemyDef.name} 攻击 ${raw} 点` +
          (absorbed > 0 ? `（护甲抵挡 ${absorbed}，受到 ${real}）` : '') +
          '。',
        'enemy',
      );
      if (s.riposte > 0) {
        s.enemyHp -= s.riposte;
        pushFx(s, { kind: 'riposte', value: s.riposte });
        pushLog(s, `【反击】对敌人造成 ${s.riposte} 点伤害。`, 'good');
      }
      break;
    }
    case 'defend': {
      if (s.enemyArmorDisabled) {
        pushFx(s, { kind: 'enemy-defend', value: intent.value, failed: true });
        pushLog(s, `${s.enemyDef.name} 试图防御，但护甲被火焰烧穿，失效了。`, 'good');
      } else {
        s.enemyArmor += intent.value;
        pushFx(s, { kind: 'enemy-defend', value: intent.value });
        pushLog(s, `${s.enemyDef.name} 获得 ${intent.value} 点护甲。`, 'enemy');
      }
      break;
    }
    case 'charge': {
      pushFx(s, { kind: 'enemy-charge' });
      pushLog(s, `${s.enemyDef.name} 正在蓄力……下回合将发动强力一击。`, 'enemy');
      break;
    }
    case 'debuff': {
      s.energyPenalty = intent.energyDown;
      pushFx(s, { kind: 'enemy-debuff', value: intent.energyDown });
      pushLog(s, `${s.enemyDef.name} 施展削弱，你下回合少 ${intent.energyDown} 点能量。`, 'enemy');
      break;
    }
  }

  s.intentIndex += 1;
  s.enemyArmorDisabled = false;

  checkEnd(s, run);
}

export function endTurn(s: BattleState, run: RunState): boolean {
  if (s.over) return false;
  if (s.pendingDiscard > 0) {
    pushLog(s, '请先完成弃牌。', 'bad');
    return false;
  }

  // 弃掉剩余手牌
  if (s.hand.length > 0) {
    s.discardPile.push(...s.hand);
    s.hand = [];
  }

  enemyAct(s, run);
  if (s.over) return true;

  startPlayerTurn(s, run);
  return true;
}

function checkEnd(s: BattleState, run: RunState): void {
  if (s.enemyHp <= 0) {
    s.enemyHp = 0;
    s.over = true;
    pushLog(s, `${s.enemyDef.name} 被击败了！`, 'good');
  }
  if (run.playerHp <= 0) {
    run.playerHp = 0;
    s.over = true;
    pushLog(s, '你倒下了……', 'bad');
  }
}

export function battleWon(s: BattleState, run: RunState): boolean {
  return s.over && s.enemyHp <= 0 && run.playerHp > 0;
}

export function battleLost(s: BattleState, run: RunState): boolean {
  return run.playerHp <= 0;
}
