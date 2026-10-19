import type { EventDef } from './types';

export const ALL_EVENTS: EventDef[] = [
  {
    id: 'campfire',
    name: '篝火',
    text: '林间空地上有一堆还在燃烧的篝火，暖意驱散了你的疲惫。你可以在这里休整，也可以把行囊里多余的牌烧掉。',
    options: [
      { label: '坐下休息', hint: '恢复 8 点生命', effect: { heal: 8 } },
      { label: '烧掉一张牌', hint: '从牌组中移除一张牌', effect: { removeCard: true } },
    ],
  },
  {
    id: 'blacksmith',
    name: '铁匠',
    text: '一位独眼铁匠在路边支起了炉子。他盯上了你的生命力，说可以用一件古物交换。',
    options: [
      {
        label: '接受交易',
        hint: '获得一个随机遗物，最大生命 -3',
        effect: { randomRelic: true, maxHp: -3 },
      },
      { label: '谢绝离开', hint: '什么也不发生', effect: {} },
    ],
  },
  {
    id: 'training',
    name: '训练场',
    text: '废弃的训练场上还立着几个稻草人。你在角落里翻出几卷残破的招式图谱。',
    options: [
      {
        label: '翻阅图谱',
        hint: '从 3 张随机卡中选 1 张加入牌组',
        effect: { addCardChoices: true },
      },
      { label: '专心练剑', hint: '恢复 4 点生命', effect: { heal: 4 } },
    ],
  },
  {
    id: 'altar',
    name: '神秘祭坛',
    text: '一座覆满苔藓的石祭坛立在雾中，坛上刻着你读不懂的文字。它似乎在等待献祭，也在等待馈赠。',
    options: [
      { label: '触碰祭坛', hint: '最大生命 +5', effect: { maxHp: 5 } },
      { label: '搜刮供品', hint: '获得 30 金币', effect: { gold: 30 } },
    ],
  },
  {
    id: 'battlefield',
    name: '旧战场',
    text: '锈蚀的兵器散落一地，乌鸦在远处盘旋。这里曾经死过很多人，也许还留着些有用的东西。',
    options: [
      { label: '搜寻遗物', hint: '获得一个随机遗物', effect: { randomRelic: true } },
      { label: '就地包扎', hint: '恢复 5 点生命', effect: { heal: 5 } },
    ],
  },
];

export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(
  ALL_EVENTS.map((e) => [e.id, e]),
);
