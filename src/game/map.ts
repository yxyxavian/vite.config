export type NodeKind = 'battle' | 'elite' | 'event' | 'camp' | 'boss';

export interface MapNode {
  index: number;
  kind: NodeKind;
  label: string;
  icon: string;
}

export const NODE_META: Record<NodeKind, { label: string; icon: string; desc: string }> = {
  battle: { label: '普通战斗', icon: '⚔️', desc: '击败敌人，获得一张新牌' },
  elite: { label: '精英战斗', icon: '🛡️', desc: '强敌，战后获得遗物与卡牌' },
  event: { label: '事件', icon: '❓', desc: '未知的遭遇' },
  camp: { label: '休营地', icon: '⛺', desc: '休整：恢复生命或删牌' },
  boss: { label: 'Boss 战', icon: '👑', desc: '堕落骑士在此等候' },
};

/**
 * 每局随机生成一条 30~50 节点的长征路线：
 * - 第 1、2 个节点固定是普通战斗（开局缓冲）
 * - 最后一个节点固定是 Boss
 * - 中间随机安插事件（约 14%）、精英（约 20%）、休营地（每 8 关一处）
 * - 其余为普通战斗；所有位置每局不同
 */
export function buildRandomMap(rand: () => number): MapNode[] {
  const length = 30 + Math.floor(rand() * 21); // 30 ~ 50
  const kinds: NodeKind[] = new Array(length).fill('battle');
  kinds[0] = 'battle';
  kinds[1] = 'battle';
  kinds[length - 1] = 'boss';

  // 中间可安排的槽位：2 .. length-2
  const slots: number[] = [];
  for (let i = 2; i < length - 1; i++) slots.push(i);
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  const middle = length - 2;
  const eventCount = Math.max(4, Math.round(middle * 0.14));
  const eliteCount = Math.max(4, Math.round(middle * 0.2));
  const campCount = Math.max(3, Math.floor(length / 8));

  let cursor = 0;
  const take = (n: number) => slots.slice(cursor, (cursor += n));
  for (const i of take(eventCount)) kinds[i] = 'event';
  for (const i of take(eliteCount)) kinds[i] = 'elite';
  for (const i of take(campCount)) kinds[i] = 'camp';

  return kinds.map((kind, index) => {
    const meta = NODE_META[kind];
    return { index, kind, label: meta.label, icon: meta.icon };
  });
}
