import type { CardDef } from './types';

const BASE: string = ((import.meta as any).env?.BASE_URL as string) ?? '/';
const A = BASE + 'assets/cards/';

/* ---------------- 攻击牌 10 张 ---------------- */

const attackCards: CardDef[] = [
  {
    id: 'charge',
    name: '冲锋',
    type: 'attack',
    cost: 1,
    art: A + 'card-atk-charge.webp',
    desc: '造成 3 点伤害。',
    play: (c) => {
      c.dealDamage(3);
    },
  },
  {
    id: 'double-slash',
    name: '双重斩',
    type: 'attack',
    cost: 1,
    art: A + 'card-atk-double-slash.webp',
    desc: '造成 2 点伤害；若本回合先出过防御牌，再造成 2 点。',
    play: (c) => {
      c.dealDamage(2);
      if (c.defensePlayed) c.dealDamage(2);
    },
  },
  {
    id: 'combo',
    name: '连击',
    type: 'attack',
    cost: 1,
    art: A + 'card-atk-combo.webp',
    desc: '若本回合已出过 2 张牌，造成 4 点伤害；否则 2 点。',
    play: (c) => {
      c.dealDamage(c.cardsPlayed >= 2 ? 4 : 2);
    },
  },
  {
    id: 'charged-slash',
    name: '蓄力斩',
    type: 'attack',
    cost: 2,
    art: A + 'card-atk-charged-slash.webp',
    desc: '造成 8 点伤害。',
    play: (c) => {
      c.dealDamage(8);
    },
  },
  {
    id: 'sunder',
    name: '破甲',
    type: 'attack',
    cost: 1,
    art: A + 'card-atk-sunder.webp',
    desc: '移除敌人全部护甲，并造成 1 点伤害。',
    play: (c) => {
      if (c.enemy.armor > 0) {
        c.say(`破甲击碎了敌人 ${c.enemy.armor} 点护甲。`);
        c.enemy.armor = 0;
      }
      c.dealDamage(1);
    },
  },
  {
    id: 'torch',
    name: '火把',
    type: 'attack',
    cost: 1,
    art: A + 'card-atk-torch.webp',
    desc: '造成 1 点伤害；敌人护甲在下个敌人回合失效。',
    play: (c) => {
      c.dealDamage(1);
      c.enemyArmorDisabled = true;
      c.say('火焰灼烧，敌人下回合无法获得护甲。');
    },
  },
  {
    id: 'shield-bash',
    name: '盾击',
    type: 'attack',
    cost: 1,
    art: A + 'card-atk-shield-bash.webp',
    desc: '造成等于当前护甲一半的伤害（向下取整）。',
    play: (c) => {
      c.dealDamage(Math.floor(c.player.armor / 2));
    },
  },
  {
    id: 'smash',
    name: '猛击',
    type: 'attack',
    cost: 2,
    art: A + 'card-atk-smash.webp',
    desc: '造成 6 点伤害。',
    play: (c) => {
      c.dealDamage(6);
    },
  },
  {
    id: 'whirlwind',
    name: '回旋斩',
    type: 'attack',
    cost: 2,
    art: A + 'card-atk-whirlwind.webp',
    desc: '造成 3 点伤害，抽 1 张牌。',
    play: (c) => {
      c.dealDamage(3);
      c.draw(1);
    },
  },
  {
    id: 'execute',
    name: '处决',
    type: 'attack',
    cost: 2,
    art: A + 'card-atk-execute.webp',
    desc: '若敌人生命 ≤ 6，造成 10 点伤害；否则 3 点。',
    play: (c) => {
      const lethal = c.enemy.hp <= 6;
      if (lethal) c.say('处决！重伤的敌人被一剑了结。');
      c.dealDamage(lethal ? 10 : 3);
    },
  },
];

/* ---------------- 防御牌 6 张 ---------------- */

const defenseCards: CardDef[] = [
  {
    id: 'shield-wall',
    name: '盾墙',
    type: 'defense',
    cost: 1,
    art: A + 'card-def-shield-wall.webp',
    desc: '获得 3 点护甲。',
    play: (c) => {
      c.gainArmor(3);
    },
  },
  {
    id: 'hold-line',
    name: '坚守',
    type: 'defense',
    cost: 1,
    art: A + 'card-def-hold-line.webp',
    desc: '获得 5 点护甲；本回合不能攻击。',
    play: (c) => {
      c.gainArmor(5);
      c.cannotAttack = true;
      c.say('你选择坚守阵地，本回合无法再攻击。');
    },
  },
  {
    id: 'riposte',
    name: '反击',
    type: 'defense',
    cost: 1,
    art: A + 'card-def-riposte.webp',
    desc: '本回合受到攻击时，对敌人造成 3 点伤害。',
    play: (c) => {
      c.riposte += 3;
      c.say('你摆出反击架势。');
    },
  },
  {
    id: 'oath',
    name: '骑士誓言',
    type: 'defense',
    cost: 1,
    art: A + 'card-def-oath.webp',
    desc: '若生命 ≤ 10，获得 6 点护甲；否则获得 3 点护甲。',
    play: (c) => {
      c.gainArmor(c.player.hp <= 10 ? 6 : 3);
    },
  },
  {
    id: 'bulwark',
    name: '铁壁',
    type: 'defense',
    cost: 2,
    art: A + 'card-def-bulwark.webp',
    desc: '获得 8 点护甲。',
    play: (c) => {
      c.gainArmor(8);
    },
  },
  {
    id: 'dodge',
    name: '闪避',
    type: 'defense',
    cost: 0,
    art: A + 'card-def-dodge.webp',
    desc: '获得 2 点护甲，抽 1 张牌。',
    play: (c) => {
      c.gainArmor(2);
      c.draw(1);
    },
  },
];

/* ---------------- 功能牌 8 张 ---------------- */

const utilityCards: CardDef[] = [
  {
    id: 'rally',
    name: '集结',
    type: 'utility',
    cost: 1,
    art: A + 'card-utl-rally.webp',
    desc: '抽 1 张牌。',
    play: (c) => {
      c.draw(1);
    },
  },
  {
    id: 'heal',
    name: '治疗',
    type: 'utility',
    cost: 1,
    art: A + 'card-utl-heal.webp',
    desc: '恢复 4 点生命。',
    play: (c) => {
      c.heal(4);
    },
  },
  {
    id: 'energy',
    name: '能量药剂',
    type: 'utility',
    cost: 0,
    art: A + 'card-utl-energy.webp',
    desc: '获得 1 点能量（本回合有效）。',
    play: (c) => {
      c.gainEnergy(1);
    },
  },
  {
    id: 'whetstone',
    name: '磨刀',
    type: 'utility',
    cost: 1,
    art: A + 'card-utl-whetstone.webp',
    desc: '本回合攻击牌伤害 +2。',
    play: (c) => {
      c.dmgBonus += 2;
      c.say('你磨快了剑刃，本回合攻击 +2 伤害。');
    },
  },
  {
    id: 'command',
    name: '号令',
    type: 'utility',
    cost: 1,
    art: A + 'card-utl-command.webp',
    desc: '本回合第一张攻击牌费用 -1。',
    play: (c) => {
      c.firstAttackDiscount = true;
      c.say('号令已下，本回合第一张攻击牌费用 -1。');
    },
  },
  {
    id: 'tactics',
    name: '战术准备',
    type: 'utility',
    cost: 1,
    art: A + 'card-utl-tactics.webp',
    desc: '抽 2 张牌，然后弃 1 张牌。',
    play: (c) => {
      c.draw(2);
      c.requestDiscard(1);
    },
  },
  {
    id: 'inspire',
    name: '鼓舞',
    type: 'utility',
    cost: 0,
    art: A + 'card-utl-inspire.webp',
    desc: '获得 2 点护甲，抽 1 张牌。',
    play: (c) => {
      c.gainArmor(2);
      c.draw(1);
    },
  },
  {
    id: 'crest',
    name: '骑士徽记',
    type: 'utility',
    cost: 2,
    art: A + 'card-utl-crest.webp',
    desc: '最大生命 +3，并恢复 3 点生命。',
    play: (c) => {
      c.player.maxHp += 3;
      c.player.hp += 3;
      c.say('骑士徽记闪耀，最大生命 +3。');
    },
  },
];

/* ---------------- 扩展攻击牌 ---------------- */

const attackCards2: CardDef[] = [
  {
    id: 'flame-slash',
    name: '烈焰斩',
    type: 'attack',
    cost: 2,
    art: A + 'card-atk-flame-slash.webp',
    desc: '造成 5 点伤害，无视护甲。',
    play: (c) => {
      c.dealDamage(5, { ignoreArmor: true });
    },
  },
  {
    id: 'heavy-blow',
    name: '重锤',
    type: 'attack',
    cost: 2,
    art: A + 'card-atk-heavy-blow.webp',
    desc: '造成 4 点伤害，并移除敌人 4 点护甲。',
    play: (c) => {
      c.enemy.armor = Math.max(0, c.enemy.armor - 4);
      c.dealDamage(4);
    },
  },
  {
    id: 'shatter-break',
    name: '碎甲击',
    type: 'attack',
    cost: 1,
    art: A + 'card-atk-shatter.webp',
    desc: '造成 2 点伤害；若敌人有护甲，改为造成 5 点伤害。',
    play: (c) => {
      c.dealDamage(c.enemy.armor > 0 ? 5 : 2);
    },
  },
];

/* ---------------- 扩展防御牌 ---------------- */

const defenseCards2: CardDef[] = [
  {
    id: 'thorn-shield',
    name: '荆棘盾',
    type: 'defense',
    cost: 1,
    art: A + 'card-def-thorn-shield.webp',
    desc: '获得 4 点护甲；本回合受到攻击时对敌人造成 2 点伤害。',
    play: (c) => {
      c.gainArmor(4);
      c.riposte = c.riposte + 2;
      c.say('荆棘竖起：本回合被攻击时反伤 2 点。');
    },
  },
  {
    id: 'holy-ward',
    name: '圣盾',
    type: 'defense',
    cost: 2,
    art: A + 'card-def-holy-ward.webp',
    desc: '获得 6 点护甲，恢复 2 点生命。',
    play: (c) => {
      c.gainArmor(6);
      c.heal(2);
    },
  },
];

/* ---------------- 扩展功能牌 ---------------- */

const utilityCards2: CardDef[] = [
  {
    id: 'swiftness',
    name: '迅捷',
    type: 'utility',
    cost: 1,
    art: A + 'card-utl-swiftness.webp',
    desc: '抽 2 张牌。',
    play: (c) => {
      c.draw(2);
    },
  },
  {
    id: 'holy-light',
    name: '圣光',
    type: 'utility',
    cost: 2,
    art: A + 'card-utl-holy-light.webp',
    desc: '恢复 8 点生命。',
    play: (c) => {
      c.heal(8);
    },
  },
  {
    id: 'blood-rage',
    name: '血怒',
    type: 'utility',
    cost: 0,
    art: A + 'card-utl-blood-rage.webp',
    desc: '失去 2 点生命，本回合攻击牌伤害 +3。',
    play: (c) => {
      c.player.hp = Math.max(1, c.player.hp - 2);
      c.dmgBonus = c.dmgBonus + 3;
      c.say('怒火燃烧：本回合攻击 +3 伤害。');
    },
  },
];

export const ALL_CARDS: CardDef[] = [
  ...attackCards,
  ...defenseCards,
  ...utilityCards,
  ...attackCards2,
  ...defenseCards2,
  ...utilityCards2,
];

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(
  ALL_CARDS.map((c) => [c.id, c]),
);

/** 初始牌组：冲锋×4、盾墙×3、治疗×1、集结×1、破甲×1 */
export const STARTING_DECK_IDS = [
  'charge',
  'charge',
  'charge',
  'charge',
  'shield-wall',
  'shield-wall',
  'shield-wall',
  'heal',
  'rally',
  'sunder',
] as const;

export function makeStartingDeck(): CardDef[] {
  return STARTING_DECK_IDS.map((id) => CARD_BY_ID[id]);
}

/** 奖励池：排除初始牌以外都可以出现（第一版全卡池） */
export function rewardPool(): CardDef[] {
  return ALL_CARDS;
}

export const TYPE_LABEL: Record<string, string> = {
  attack: '攻击',
  defense: '防御',
  utility: '功能',
};
