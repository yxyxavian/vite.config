/** 全局共享类型 —— 只放接口，不放运行时依赖，避免循环引用 */

import type { MapNode } from './map';

export type CardType = 'attack' | 'defense' | 'utility';

/** 战斗特效事件：逻辑层产生，UI 层消费后播放动画 */
export type FxEvent =
  | { kind: 'banner'; text: string; tone: 'enemy' | 'player' }
  | { kind: 'enemy-hit'; total: number; absorbed: number; real: number }
  | { kind: 'enemy-attack'; value: number; absorbed: number; real: number }
  | { kind: 'enemy-selfdamage'; value: number }
  | { kind: 'enemy-defend'; value: number; failed?: boolean }
  | { kind: 'enemy-charge' }
  | { kind: 'enemy-debuff'; value: number }
  | { kind: 'riposte'; value: number }
  | { kind: 'player-armor'; value: number }
  | { kind: 'player-heal'; value: number }
  | { kind: 'player-hurt'; real: number };

/** 打出一张牌时，暴露给卡牌脚本的战斗上下文 */
export interface CardRuntime {
  readonly player: { hp: number; maxHp: number; armor: number; energy: number };
  readonly enemy: { hp: number; maxHp: number; armor: number };
  /** 对敌人造成伤害（自动叠加本回合伤害加成、自动扣敌人护甲） */
  dealDamage(amount: number, opts?: { ignoreArmor?: boolean }): void;
  gainArmor(amount: number): void;
  heal(amount: number): void;
  draw(count: number): void;
  gainEnergy(amount: number): void;
  /** 请求弃牌（战术准备等），会进入待弃牌状态等待玩家点选 */
  requestDiscard(count: number): void;

  enemyArmorDisabled: boolean;
  dmgBonus: number;
  cardsPlayed: number;
  defensePlayed: boolean;
  cannotAttack: boolean;
  riposte: number;
  firstAttackDiscount: boolean;
  /** 追加一条战斗日志 */
  say(text: string): void;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  art: string;
  desc: string;
  play(c: CardRuntime): void;
}

export interface CardInstance {
  uid: number;
  def: CardDef;
}

export type Intent =
  | { kind: 'attack'; value: number; selfDamage?: number }
  | { kind: 'defend'; value: number }
  | { kind: 'charge' }
  | { kind: 'debuff'; energyDown: number; label: string };

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  art: string;
  tier: 'normal' | 'elite' | 'boss';
  pattern: Intent[];
}

export interface RelicDef {
  id: string;
  name: string;
  art: string;
  desc: string;
}

export interface EventEffect {
  heal?: number;
  maxHp?: number;
  gold?: number;
  randomRelic?: boolean;
  /** 需要玩家从牌组里选一张删除 */
  removeCard?: boolean;
  /** 从 3 张随机卡里选 1 张加入牌组 */
  addCardChoices?: boolean;
}

export interface EventOption {
  label: string;
  hint?: string;
  effect: EventEffect;
}

export interface EventDef {
  id: string;
  name: string;
  text: string;
  options: EventOption[];
}

export type Screen = 'start' | 'map' | 'battle' | 'reward' | 'event' | 'camp' | 'result';

export interface LogEntry {
  text: string;
  kind: 'player' | 'enemy' | 'system' | 'good' | 'bad';
}

export interface BattleState {
  enemyDef: EnemyDef;
  enemyHp: number;
  enemyMaxHp: number;
  enemyArmor: number;
  intentIndex: number;
  turn: number;
  energy: number;
  maxEnergy: number;
  playerArmor: number;
  drawPile: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];
  cardsPlayed: number;
  defensePlayed: boolean;
  attackUsedThisTurn: boolean;
  dmgBonus: number;
  firstAttackDiscount: boolean;
  firstDefenseDiscount: boolean;
  cannotAttack: boolean;
  riposte: number;
  enemyArmorDisabled: boolean;
  /** 本场战斗是否已消耗过"第一张攻击牌"类遗物 */
  firstAttackDone: boolean;
  /** 下回合能量惩罚（法师削弱） */
  energyPenalty: number;
  pendingDiscard: number;
  over: boolean;
  log: LogEntry[];
  /** 待播放的特效事件队列（UI 层播放后清空） */
  fx: FxEvent[];
}

export interface RunState {
  screen: Screen;
  /** 本局的随机路线（8~10 个节点），每局重新生成 */
  map: MapNode[];
  /** 当前所在节点下标，0 表示第一个节点 */
  nodeIndex: number;
  playerHp: number;
  playerMaxHp: number;
  deck: CardDef[];
  relics: string[];
  gold: number;
  startTime: number;
  endTime: number | null;
  result: 'win' | 'lose' | null;
  battle: BattleState | null;
  rewardChoices: CardDef[] | null;
  rewardRelicChoices: string[] | null;
  eventDef: EventDef | null;
  eventResult: string | null;
  /** 事件里等待玩家从牌组选牌删除 */
  pendingRemove: boolean;
  /** 事件里等待玩家从候选卡中选一张 */
  pendingCardChoices: CardDef[] | null;
  message: string | null;
  nodeResults: { index: number; label: string }[];
}
