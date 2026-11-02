/**
 * Layout constants. Colors, type, shapes and elevation live in the design
 * system (`@/theme`).
 */

import "@/global.css";

import { Space } from "@/theme";

/**
 * Layout spacing on the 4dp grid, named by step. Values come from the design
 * system's `Space` tokens.
 */
export const Spacing = {
  one: Space.xs,
  two: Space.sm,
  three: Space.lg,
  four: Space.xl,
  five: Space.xxl,
  six: Space.huge,
} as const;

export const MaxContentWidth = 800;
