/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

import { Space } from "@/theme";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Brand colors shared by light and dark mode (same blue as the splash screen). */
export const Brand = {
  primary: "#fcba03",
  onPrimary: "#ffffff",
  danger: "#E5484D",
} as const;

/** Colors for the nutrition dashboard, readable on both light and dark surfaces. */
export const Nutrition = {
  calories: Brand.primary,
  carbs: "#12A594",
  protein: "#F76B15",
  fat: "#8E4EC6",
  steps: "#3E63DD",
  exercise: "#E5484D",
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

/**
 * Layout spacing on the 4dp grid, named by step. Values come from the design
 * system's `Space` tokens.
 */
export const Spacing = {
  half: Space.xs / 2,
  one: Space.xs,
  two: Space.sm,
  three: Space.lg,
  four: Space.xl,
  five: Space.xxl,
  six: Space.huge,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
