import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  measure,
  scrollTo,
  useAnimatedReaction,
  useAnimatedStyle,
  useFrameCallback,
  useScrollOffset,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTabSwipeLock } from '@/components/sliding-tabs/swipe-lock';
import { Spacing } from '@/constants/theme';
import {
  MAX_SIDE_BY_SIDE,
  type DashboardRows,
  type DashboardWidget,
  type DropTarget,
} from '@/lib/dashboard-widgets';
import { ComponentElevation, Shape, shadowFor, useAppTheme, withAlpha } from '@/theme';

/** How long a finger rests on an item before it can be dragged. */
const LONG_PRESS_MS = 400;
const ROW_GAP = Spacing.three;
/** Distance from the top/bottom of the screen where dragging scrolls the page. */
const SCROLL_EDGE = 96;
/** Fastest auto-scroll, in pixels per frame. */
const SCROLL_SPEED = 14;

type RowGeometry = {
  key: string;
  y: number;
  height: number;
  /** `x` is relative to the row; in a carousel, to its scrolled track. */
  cells: { id: DashboardWidget; x: number; width: number }[];
};

/** Drop target as plain numbers, so worklets can read and write it. */
type TargetValue = {
  /** 0 = nowhere (back to where it was), 1 = insert, 2 = join. */
  kind: 0 | 1 | 2;
  index: number;
  /** Position among the row's items, for `join`. */
  position: number;
};

const NO_TARGET: TargetValue = { kind: 0, index: 0, position: 0 };

type DraggableDashboardProps = {
  rows: DashboardRows;
  /** Renders an item; `compact` when it shares its row side by side with another one. */
  renderItem: (id: DashboardWidget, compact: boolean) => ReactNode;
  onMove: (id: DashboardWidget, target: DropTarget) => void;
  /** Scroll view of the screen, scrolled when the dragged item nears an edge. */
  scrollRef: AnimatedRef<Animated.ScrollView>;
  /** Called when a drag starts and ends, e.g. to stop the page from scrolling. */
  onDraggingChange: (dragging: boolean) => void;
};

/**
 * Dashboard rows whose items move by long-pressing and dragging them: dropped
 * between rows, an item gets a row of its own; dropped on the middle of
 * another row, it joins that row. Two items in a row sit side by side in
 * their compact version; three or more form a carousel at full size.
 */
export function DraggableDashboard({
  rows,
  renderItem,
  onMove,
  scrollRef,
  onDraggingChange,
}: DraggableDashboardProps) {
  const { colors } = useAppTheme();
  const lockTabSwipe = useTabSwipeLock();
  const [draggingId, setDraggingId] = useState<DashboardWidget | null>(null);
  const [width, setWidth] = useState(0);

  // Sizes measured with `onLayout`, in container coordinates. Plain JS maps:
  // several layouts arrive in the same frame, and writes to a shared value
  // from JS are asynchronous, so merging into one would drop entries.
  const rowSizes = useRef(new Map<string, { y: number; height: number }>());
  const cellSizes = useRef(new Map<DashboardWidget, { x: number; width: number }>());
  /** Complete layout, copied to the UI thread for the gesture worklets. */
  const geometry = useSharedValue<RowGeometry[]>([]);
  const containerWidth = useSharedValue(0);
  /** Scroll offset of each carousel row, by row key (written on the UI thread). */
  const carouselOffsets = useSharedValue<Record<string, number>>({});

  const dragId = useSharedValue<DashboardWidget | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startPointer = useSharedValue({ x: 0, y: 0 });
  const startScroll = useSharedValue(0);
  const fingerY = useSharedValue(0);
  const target = useSharedValue<TargetValue>(NO_TARGET);
  const scrollOffset = useScrollOffset(scrollRef);

  function syncGeometry() {
    const next: RowGeometry[] = [];
    for (const row of rows) {
      const key = rowKey(row);
      const size = rowSizes.current.get(key);
      const cells = row.map((id) => ({ id, ...cellSizes.current.get(id) }));
      if (!size || cells.some((cell) => cell.x === undefined)) return;
      next.push({ key, ...size, cells: cells as RowGeometry['cells'] });
    }
    geometry.set(next);
  }

  // Rows change after a drop moved an item: clear the drag before the new
  // layout is painted, so the item does not flash at its old spot.
  useLayoutEffect(() => {
    dragId.set(null);
    translateX.set(0);
    translateY.set(0);
    target.set(NO_TARGET);
  }, [rows, dragId, translateX, translateY, target]);

  /** Recomputes the drop target from the finger position (worklet). */
  function updateTarget() {
    'worklet';
    const id = dragId.get();
    if (id === null) return;
    const start = startPointer.get();
    const x = start.x + translateX.get();
    const y = start.y + translateY.get() + scrollOffset.get() - startScroll.get();
    target.set(computeTarget(geometry.get(), id, x, y));
  }

  const autoScroll = useFrameCallback(() => {
    if (dragId.get() === null) return;
    const frame = measure(scrollRef);
    if (!frame) return;
    const top = frame.pageY + SCROLL_EDGE;
    const bottom = frame.pageY + frame.height - SCROLL_EDGE;
    const y = fingerY.get();
    let delta = 0;
    if (y < top) delta = -SCROLL_SPEED * Math.min((top - y) / SCROLL_EDGE, 1);
    else if (y > bottom) delta = SCROLL_SPEED * Math.min((y - bottom) / SCROLL_EDGE, 1);
    if (delta === 0) return;
    scrollTo(scrollRef, 0, Math.max(scrollOffset.get() + delta, 0), false);
    updateTarget();
  }, false);

  function handleDragStart(id: DashboardWidget) {
    setDraggingId(id);
    lockTabSwipe(true);
    onDraggingChange(true);
    autoScroll.setActive(true);
  }

  function handleDrop(id: DashboardWidget, value: TargetValue) {
    autoScroll.setActive(false);
    lockTabSwipe(false);
    onDraggingChange(false);
    setDraggingId(null);
    if (value.kind === 0) return;
    onMove(
      id,
      value.kind === 1
        ? { kind: 'insert', index: value.index }
        : { kind: 'join', index: value.index, position: value.position },
    );
  }

  function makeGesture(id: DashboardWidget) {
    return Gesture.Pan()
      .activateAfterLongPress(LONG_PRESS_MS)
      .onStart((event) => {
        const row = geometry.get().find((candidate) => candidate.cells.some((c) => c.id === id));
        const cell = row?.cells.find((c) => c.id === id);
        if (!row || !cell) return;
        // In a carousel the cell sits on a scrolled track.
        const scrolled = carouselOffsets.get()[row.key] ?? 0;
        dragId.set(id);
        translateX.set(0);
        translateY.set(0);
        startPointer.set({ x: cell.x - scrolled + event.x, y: row.y + event.y });
        startScroll.set(scrollOffset.get());
        fingerY.set(event.absoluteY);
        target.set(NO_TARGET);
        scheduleOnRN(handleDragStart, id);
      })
      .onUpdate((event) => {
        if (dragId.get() !== id) return;
        translateX.set(event.translationX);
        translateY.set(event.translationY);
        fingerY.set(event.absoluteY);
        updateTarget();
      })
      .onFinalize(() => {
        if (dragId.get() !== id) return;
        const value = target.get();
        if (value.kind === 0) {
          // Back to where it was: fold the scroll into the translation, then glide home.
          translateY.set(translateY.get() + scrollOffset.get() - startScroll.get());
          startScroll.set(scrollOffset.get());
          translateX.set(withTiming(0));
          translateY.set(
            withTiming(0, undefined, (finished) => {
              if (finished) dragId.set(null);
            }),
          );
        }
        scheduleOnRN(handleDrop, id, value);
      });
  }

  /** Screen reader alternative to dragging: move up or down one row. */
  function onAccessibilityAction(id: DashboardWidget, event: AccessibilityActionEvent) {
    const index = rows.findIndex((row) => row.includes(id));
    const shared = rows[index].length > 1;
    if (event.nativeEvent.actionName === 'moveUp') {
      if (shared) onMove(id, { kind: 'insert', index });
      else if (index > 0) onMove(id, { kind: 'insert', index: index - 1 });
    } else if (event.nativeEvent.actionName === 'moveDown') {
      if (shared) onMove(id, { kind: 'insert', index: index + 1 });
      else if (index < rows.length - 1) onMove(id, { kind: 'insert', index: index + 2 });
    }
  }

  const joinFill = withAlpha(colors.secondary, 0.16);
  const indicatorStyle = useAnimatedStyle(() => {
    const value = target.get();
    const rects = geometry.get();
    if (value.kind === 0 || rects.length === 0) return { opacity: 0 };
    const full = containerWidth.get();
    if (value.kind === 2) {
      const row = rects[value.index];
      // Joining a single item: highlight the half it will take. Otherwise
      // (side by side or carousel) highlight the whole row.
      const half = (full - ROW_GAP) / 2;
      const single = row.cells.length === 1;
      return {
        opacity: 1,
        top: row.y,
        height: row.height,
        left: single && value.position === 1 ? half + ROW_GAP : 0,
        width: single ? half : full,
        borderWidth: 2,
        backgroundColor: joinFill,
      };
    }
    const n = rects.length;
    const y =
      value.index === 0
        ? rects[0].y - ROW_GAP / 2
        : value.index >= n
          ? rects[n - 1].y + rects[n - 1].height + ROW_GAP / 2
          : (rects[value.index - 1].y + rects[value.index - 1].height + rects[value.index].y) / 2;
    return {
      opacity: 1,
      top: y - 2,
      height: 4,
      left: 0,
      width: full,
      borderWidth: 0,
      backgroundColor: colors.secondary,
    };
  });

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        containerWidth.set(event.nativeEvent.layout.width);
        setWidth(event.nativeEvent.layout.width);
      }}>
      {rows.map((row) => {
        const key = rowKey(row);
        const carousel = row.length > MAX_SIDE_BY_SIDE;
        // Same width as a full-row card; the page dots show there are more.
        const cardWidth = width;
        const cells = row.map((id) => (
          <DraggableCell
            key={id}
            id={id}
            gesture={makeGesture(id)}
            dragId={dragId}
            translateX={translateX}
            translateY={translateY}
            scrollOffset={scrollOffset}
            startScroll={startScroll}
            lifted={draggingId === id}
            width={carousel ? cardWidth : undefined}
            onLayout={(x, cellWidth) => {
              cellSizes.current.set(id, { x, width: cellWidth });
              syncGeometry();
            }}
            onAccessibilityAction={(event) => onAccessibilityAction(id, event)}>
            {renderItem(id, row.length === MAX_SIDE_BY_SIDE)}
          </DraggableCell>
        ));

        return (
          <View
            key={key}
            style={[styles.row, draggingId && row.includes(draggingId) && styles.raised]}
            onLayout={(event) => {
              const { y, height } = event.nativeEvent.layout;
              rowSizes.current.set(key, { y, height });
              syncGeometry();
            }}>
            {carousel ? (
              <CarouselRow
                rowId={key}
                count={row.length}
                step={cardWidth + ROW_GAP}
                offsets={carouselOffsets}>
                {cells}
              </CarouselRow>
            ) : (
              cells
            )}
          </View>
        );
      })}

      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, { borderColor: colors.secondary }, indicatorStyle]}
      />
    </View>
  );
}

type CarouselRowProps = {
  rowId: string;
  count: number;
  /** Card width plus the gap: the distance between pages. */
  step: number;
  offsets: SharedValue<Record<string, number>>;
  children: ReactNode;
};

/** How far a release "throws" the carousel, in seconds of velocity. */
const VELOCITY_PROJECTION = 0.2;
/** Resistance when swiping past the first or last card. */
const EDGE_RESISTANCE = 0.3;

/**
 * Horizontal carousel of full-size cards that snaps to each card, with page
 * dots below. It does not clip its cards, so a card dragged out of it stays
 * visible (the page's scroll view still clips at the screen edges).
 */
function CarouselRow({ rowId, count, step, offsets, children }: CarouselRowProps) {
  const { colors } = useAppTheme();
  const offset = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const [page, setPage] = useState(0);
  const maxOffset = (count - 1) * step;

  // A card left the carousel: keep the offset within the remaining cards.
  useEffect(() => {
    if (offset.get() > maxOffset) offset.set(withTiming(maxOffset));
  }, [maxOffset, offset]);

  useAnimatedReaction(
    () => offset.get(),
    (value) => {
      offsets.set({ ...offsets.get(), [rowId]: value });
    },
  );
  // Only crosses to the JS thread when the page changes, not on every frame.
  useAnimatedReaction(
    () => (step > 0 ? Math.min(Math.max(Math.round(offset.get() / step), 0), count - 1) : 0),
    (current, previous) => {
      if (current !== previous) scheduleOnRN(setPage, current);
    },
  );

  const swipe = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      dragStart.set(offset.get());
    })
    .onUpdate((event) => {
      const raw = dragStart.get() - event.translationX;
      let next = raw;
      if (raw < 0) next = raw * EDGE_RESISTANCE;
      else if (raw > maxOffset) next = maxOffset + (raw - maxOffset) * EDGE_RESISTANCE;
      offset.set(next);
    })
    .onEnd((event) => {
      const projected = offset.get() - event.velocityX * VELOCITY_PROJECTION;
      const target = Math.min(Math.max(Math.round(projected / step), 0), count - 1);
      offset.set(withTiming(target * step, { duration: 250 }));
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.get() }],
  }));

  return (
    <View style={styles.carousel}>
      <GestureDetector gesture={swipe}>
        <Animated.View style={[styles.track, trackStyle]}>{children}</Animated.View>
      </GestureDetector>
      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no">
        {Array.from({ length: count }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === page ? colors.secondary : colors.outlineVariant },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

type DraggableCellProps = {
  id: DashboardWidget;
  /** Long-press drag gesture, attached to the cell's own view. */
  gesture: ReturnType<typeof Gesture.Pan>;
  dragId: SharedValue<DashboardWidget | null>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scrollOffset: SharedValue<number>;
  startScroll: SharedValue<number>;
  /** Being dragged: drawn above the rest with a shadow. */
  lifted: boolean;
  /** Fixed width (carousel card); otherwise the cell shares the row equally. */
  width?: number;
  onLayout: (x: number, width: number) => void;
  onAccessibilityAction: (event: AccessibilityActionEvent) => void;
  children: ReactNode;
};

function DraggableCell({
  id,
  gesture,
  dragId,
  translateX,
  translateY,
  scrollOffset,
  startScroll,
  lifted,
  width,
  onLayout,
  onAccessibilityAction,
  children,
}: DraggableCellProps) {
  const { colors } = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const dragging = dragId.get() === id;
    return {
      transform: [
        { translateX: dragging ? translateX.get() : 0 },
        {
          // The page may scroll under the finger: follow it.
          translateY: dragging ? translateY.get() + scrollOffset.get() - startScroll.get() : 0,
        },
        { scale: withTiming(dragging ? 1.03 : 1, { duration: 150 }) },
      ],
    };
  });

  // The detector must wrap the view itself: it attaches through the child's ref.
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          width === undefined ? styles.cell : { width },
          lifted && styles.lifted,
          lifted && { boxShadow: shadowFor(ComponentElevation.fab, colors) },
          animatedStyle,
        ]}
        onLayout={(event) => onLayout(event.nativeEvent.layout.x, event.nativeEvent.layout.width)}
        // No label: screen readers read the card's own content.
        accessible
        accessibilityHint="Toque e segure para arrastar e reposicionar."
        accessibilityActions={[
          { name: 'moveUp', label: 'Mover para cima' },
          { name: 'moveDown', label: 'Mover para baixo' },
        ]}
        onAccessibilityAction={onAccessibilityAction}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

function rowKey(row: DashboardWidget[]) {
  return row.join('+');
}

/**
 * Where the finger at (`x`, `y`) would drop `id` (worklet). The middle half
 * of another row joins it: next to a single item on the side of the finger,
 * between two side-by-side items by where the finger is, or at the end of a
 * carousel. Anywhere else inserts a row before or after the nearest one.
 * Spots that leave the layout as it is return no target.
 */
function computeTarget(rows: RowGeometry[], id: DashboardWidget, x: number, y: number): TargetValue {
  'worklet';
  const n = rows.length;
  let result: TargetValue = { kind: 1, index: n, position: 0 };
  for (let i = 0; i < n; i++) {
    const row = rows[i];
    if (y < row.y) {
      result = { kind: 1, index: i, position: 0 };
      break;
    }
    if (y <= row.y + row.height) {
      const relative = (y - row.y) / row.height;
      const own = row.cells.some((cell) => cell.id === id);
      if (!own && relative > 0.25 && relative < 0.75) {
        let position = row.cells.length;
        if (row.cells.length <= MAX_SIDE_BY_SIDE) {
          position = row.cells.filter((cell) => cell.x + cell.width / 2 < x).length;
        }
        result = { kind: 2, index: i, position };
      } else {
        result = { kind: 1, index: relative < 0.5 ? i : i + 1, position: 0 };
      }
      break;
    }
  }
  // Inserting right above or below its own single-item row changes nothing.
  const own = rows.findIndex((row) => row.cells.some((cell) => cell.id === id));
  if (
    result.kind === 1 &&
    own !== -1 &&
    rows[own].cells.length === 1 &&
    (result.index === own || result.index === own + 1)
  ) {
    return NO_TARGET;
  }
  return result;
}

const styles = StyleSheet.create({
  container: {
    gap: ROW_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: ROW_GAP,
  },
  raised: {
    // Above the drop indicator.
    zIndex: 3,
  },
  cell: {
    flex: 1,
  },
  lifted: {
    zIndex: 1,
  },
  carousel: {
    flex: 1,
    gap: Spacing.two,
  },
  track: {
    flexDirection: 'row',
    gap: ROW_GAP,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Shape.full,
  },
  indicator: {
    position: 'absolute',
    borderRadius: Shape.large,
    zIndex: 2,
  },
});
