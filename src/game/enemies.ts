import type { EnemyDef } from './types';

const BASE: string = ((import.meta as any).env?.BASE_URL as string) ?? '/';
const E = BASE + 'assets/enemies/';

export const NORMAL_ENEMIES: EnemyDef[] = [
  {
    id: 'goblin',
    name: '哥布林',
    hp: 12,
    art: E + 'enemy-goblin.png',
    tier: 'normal',
    pattern: [{ kind: 'attack', value: 4 }, { kind: 'defend', value: 3 }],
  },
  {
    id: 'wolf',
    name: '狼',
    hp: 10,
    art: E + 'enemy-wolf.png',
    tier: 'normal',
    pattern: [{ kind: 'attack', value: 3 }, { kind: 'attack', value: 5 }],
  },
  {
    id: 'archer',
    name: '弓箭手',
    hp: 14,
    art: E + 'enemy-archer.png',
    tier: 'normal',
    pattern: [{ kind: 'attack', value: 5 }, { kind: 'charge' }, { kind: 'attack', value: 7 }],
  },
  {
    id: 'shieldman',
    name: '盾兵',
    hp: 18,
    art: E + 'enemy-shieldman.png',
    tier: 'normal',
    pattern: [{ kind: 'defend', value: 6 }, { kind: 'attack', value: 4 }],
  },
  {
    id: 'mage',
    name: '法师',
    hp: 16,
    art: E + 'enemy-mage.png',
    tier: 'normal',
    pattern: [
      { kind: 'attack', value: 7 },
      { kind: 'debuff', energyDown: 1, label: '削弱' },
    ],
  },
  {
    id: 'berserker',
    name: '狂战士',
    hp: 20,
    art: E + 'enemy-berserker.png',
    tier: 'normal',
    pattern: [
      { kind: 'attack', value: 6 },
      { kind: 'attack', value: 8, selfDamage: 2 },
    ],
  },
  {
    id: 'assassin',
    name: '刺客',
    hp: 12,
    art: E + 'enemy-assassin.png',
    tier: 'normal',
    pattern: [{ kind: 'attack', value: 8 }, { kind: 'defend', value: 2 }],
  },
  {
    id: 'gargoyle',
    name: '石像鬼',
    hp: 22,
    art: E + 'enemy-gargoyle.png',
    tier: 'normal',
    pattern: [{ kind: 'defend', value: 8 }, { kind: 'attack', value: 5 }],
  },
];

export const BOSS: EnemyDef = {
  id: 'fallen-knight',
  name: '堕落骑士',
  hp: 40,
  art: E + 'enemy-boss-fallen-knight.png',
  tier: 'boss',
  pattern: [
    { kind: 'attack', value: 8 },
    { kind: 'defend', value: 6 },
    { kind: 'charge' },
    { kind: 'attack', value: 14 },
  ],
};

/** 中期敌人：路线中段出现 */
export const MID_ENEMIES: EnemyDef[] = [
  {
    id: 'skeleton',
    name: '骷髅兵',
    hp: 15,
    art: E + 'enemy-skeleton.png',
    tier: 'normal',
    pattern: [{ kind: 'attack', value: 4 }, { kind: 'attack', value: 4 }, { kind: 'defend', value: 4 }],
  },
  {
    id: 'bat',
    name: '巨蝠',
    hp: 12,
    art: E + 'enemy-bat.png',
    tier: 'normal',
    pattern: [
      { kind: 'attack', value: 3 },
      { kind: 'debuff', energyDown: 1, label: '尖啸：能量 -1' },
    ],
  },
  {
    id: 'ghost',
    name: '幽灵',
    hp: 17,
    art: E + 'enemy-ghost.png',
    tier: 'normal',
    pattern: [{ kind: 'attack', value: 5 }, { kind: 'defend', value: 5 }],
  },
  {
    id: 'spider',
    name: '毒蛛',
    hp: 14,
    art: E + 'enemy-spider.png',
    tier: 'normal',
    pattern: [
      { kind: 'attack', value: 4 },
      { kind: 'attack', value: 2 },
      { kind: 'debuff', energyDown: 1, label: '毒雾：能量 -1' },
    ],
  },
];

/** 后期敌人：路线后段出现，明显更强 */
export const LATE_ENEMIES: EnemyDef[] = [
  {
    id: 'ogre',
    name: '食人魔',
    hp: 28,
    art: E + 'enemy-ogre.png',
    tier: 'normal',
    pattern: [{ kind: 'attack', value: 7 }, { kind: 'charge' }, { kind: 'attack', value: 10 }],
  },
  {
    id: 'orc',
    name: '兽人武士',
    hp: 26,
    art: E + 'enemy-orc.png',
    tier: 'normal',
    pattern: [
      { kind: 'attack', value: 6 },
      { kind: 'defend', value: 5 },
      { kind: 'attack', value: 8 },
    ],
  },
  {
    id: 'necromancer',
    name: '死灵法师',
    hp: 22,
    art: E + 'enemy-necromancer.png',
    tier: 'normal',
    pattern: [{ kind: 'charge' }, { kind: 'attack', value: 9 }, { kind: 'defend', value: 4 }],
  },
  {
    id: 'dragon',
    name: '幼龙',
    hp: 32,
    art: E + 'enemy-dragon.png',
    tier: 'normal',
    pattern: [
      { kind: 'attack', value: 8 },
      { kind: 'defend', value: 6 },
      { kind: 'attack', value: 10 },
    ],
  },
];

/** 精英：随机普通敌人 +6 生命 */
export function makeElite(base: EnemyDef): EnemyDef {
  return {
    ...base,
    name: base.name + '（精英）',
    hp: base.hp + 6,
    tier: 'elite',
  };
}

export const ENEMY_BY_ID: Record<string, EnemyDef> = Object.fromEntries(
  [...NORMAL_ENEMIES, ...MID_ENEMIES, ...LATE_ENEMIES, BOSS].map((e) => [e.id, e]),
);
