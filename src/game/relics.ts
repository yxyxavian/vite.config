import type { RelicDef } from './types';

const BASE: string = ((import.meta as any).env?.BASE_URL as string) ?? '/';
const R = BASE + 'assets/relics/';

export const ALL_RELICS: RelicDef[] = [
  {
    id: 'iron-shield',
    name: '铁盾',
    art: R + 'relic-iron-shield.png',
    desc: '每场战斗第一回合获得 3 点护甲。',
  },
  {
    id: 'whetstone',
    name: '磨刀石',
    art: R + 'relic-whetstone.png',
    desc: '每场战斗第一张攻击牌 +2 伤害。',
  },
  {
    id: 'first-aid',
    name: '急救包',
    art: R + 'relic-first-aid.png',
    desc: '每场战斗结束后恢复 3 点生命。',
  },
  {
    id: 'war-banner',
    name: '战旗',
    art: R + 'relic-war-banner.png',
    desc: '每回合第一张防御牌费用 -1。',
  },
  {
    id: 'knight-badge',
    name: '骑士徽章',
    art: R + 'relic-knight-badge.png',
    desc: '最大生命 +5。',
  },
  {
    id: 'torch',
    name: '火把遗物',
    art: R + 'relic-torch.png',
    desc: '每场战斗第一回合多抽 1 张牌。',
  },
  {
    id: 'bracer',
    name: '护腕',
    art: R + 'relic-bracer.png',
    desc: '每回合第一次攻击 +1 伤害。',
  },
  {
    id: 'old-map',
    name: '旧地图',
    art: R + 'relic-old-map.png',
    desc: '事件节点多一个选项。',
  },
];

export const RELIC_BY_ID: Record<string, RelicDef> = Object.fromEntries(
  ALL_RELICS.map((r) => [r.id, r]),
);
