import type { Point } from "game/@types";
import { SCREEN_WIDTH } from "./screen";

export const SEATS: Point[] = [
  { x: 44, y: 700 },
  { x: 120, y: 200 },
  { x: 602, y: 90 },
  { x: 1098, y: 90 },
  { x: 1600, y: 180 },
];

export const WAITING_ROOM_SEATS: Point[] = [
  { x: SCREEN_WIDTH / 2 - 100, y: 450 },
  { x: 120, y: 200 },
  { x: 602, y: 90 },
  { x: 1098, y: 90 },
  { x: 1600, y: 180 },
];

export const GAME_ROOM_SEATS: Point[] = [
  { x: 44, y: 700 },
  { x: 120, y: 200 },
  { x: 602, y: 90 },
  { x: 1098, y: 90 },
  { x: 1600, y: 180 },
];
