/* 长地图节点布局：AI 拼接长图（ui-map-long.png）+ 离线检测的可放节点位。
   ROAD_SAMPLES 由 tools/stitch_map.py 生成：只含"确认在路面上"的位置（y 升序）。 */

import { MAP_IMG_H, MAP_IMG_W, ROAD_SAMPLES } from './mapPath';

export interface MapPoint {
  x: number;
  y: number;
}
export interface MapLayout {
  w: number;
  h: number;
  points: MapPoint[];
}

export function computeMapLayout(count: number): MapLayout {
  const list = [...ROAD_SAMPLES].sort((a, b) => b[0] - a[0]); // 底部（起点）在前
  const n = list.length;
  const points: MapPoint[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.min(n - 1, Math.round((i * (n - 1)) / Math.max(1, count - 1)));
    points.push({ x: list[idx][1], y: list[idx][0] });
  }
  return { w: MAP_IMG_W, h: MAP_IMG_H, points };
}
