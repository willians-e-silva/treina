import CircleMinus from "lucide-react-native/icons/circle-minus";
import LayoutDashboard from "lucide-react-native/icons/layout-dashboard";
import Pencil from "lucide-react-native/icons/pencil";
import Plus from "lucide-react-native/icons/plus";
import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useAnimatedRef } from "react-native-reanimated";
import type Animated from "react-native-reanimated";

import { AppIcon } from "@/components/app-logo";
import { ExerciseTile, StepsTile } from "@/components/dashboard/activity-tiles";
import { CaloriesCard } from "@/components/dashboard/calories-card";
import { DraggableDashboard } from "@/components/dashboard/draggable-dashboard";
import { MacrosCard } from "@/components/dashboard/macros-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { WeightCard } from "@/components/dashboard/weight-card";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { Surface } from "@/components/ui/surface";
import { Spacing } from "@/constants/theme";
import { useDashboardLayout } from "@/context/dashboard-layout";
import { useExerciseDay } from "@/context/exercise-log";
import { useFoodDay } from "@/context/food-log";
import { MOCK_DASHBOARD } from "@/lib/dashboard-data";
import { DASHBOARD_WIDGETS, getWidgetInfo, type DashboardWidget } from "@/lib/dashboard-widgets";
import { toDateKey } from "@/lib/exercises";
import { ComponentShape, useAppTheme } from "@/theme";

export default function HomeScreen() {
  // TODO: load steps and weight from the real sources.
  const data = MOCK_DASHBOARD;
  const today = toDateKey(new Date());
  const exerciseDay = useExerciseDay(today);
  const exercise = { calories: exerciseDay.calories, minutes: exerciseDay.minutes };
  const food = useFoodDay(today).totals;
  const macros = {
    carbs: { ...data.macros.carbs, consumed: Math.round(food.carbs) },
    protein: { ...data.macros.protein, consumed: Math.round(food.protein) },
    fat: { ...data.macros.fat, consumed: Math.round(food.fat) },
  };

  const { rows, widgets, addWidget, removeWidget, moveWidget } = useDashboardLayout();
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const hidden = DASHBOARD_WIDGETS.filter((widget) => !widgets.includes(widget.id));

  /** A dashboard item; `compact` when it shares its row with another one. */
  function renderCard(id: DashboardWidget, compact: boolean): ReactNode {
    switch (id) {
      case "calories":
        return (
          <CaloriesCard
            compact={compact}
            calories={{ ...data.calories, food: Math.round(food.kcal), exercise: exercise.calories }}
          />
        );
      case "macros":
        return <MacrosCard compact={compact} macros={macros} />;
      case "steps":
        return <StepsTile steps={data.steps} />;
      case "exercise":
        return <ExerciseTile exercise={exercise} />;
      case "tasks":
        return <TasksCard compact={compact} date={today} />;
      case "weight":
        return <WeightCard compact={compact} weight={data.weight} />;
    }
  }

  return (
    <TabScreen header={<AppIcon />} scrollRef={scrollRef} scrollEnabled={!dragging}>
      <View style={styles.titleRow}>
        <ThemedText type="headlineMedium" accessibilityRole="header">
          Hoje
        </ThemedText>
        {editing ? (
          <Button label="Concluir" onPress={() => setEditing(false)} />
        ) : (
          <IconButton
            icon={Pencil}
            onPress={() => setEditing(true)}
            accessibilityLabel="Editar tela inicial"
          />
        )}
      </View>

      <DraggableDashboard
        rows={rows}
        onMove={moveWidget}
        scrollRef={scrollRef}
        onDraggingChange={setDragging}
        renderItem={(id, compact) =>
          editing ? (
            <EditableWidget id={id} onRemove={() => removeWidget(id)}>
              {renderCard(id, compact)}
            </EditableWidget>
          ) : (
            renderCard(id, compact)
          )
        }
      />

      {widgets.length === 0 && !editing && (
        <Surface style={styles.empty}>
          <EmptyIcon />
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.emptyText}>
            Nenhum item na tela inicial.
          </ThemedText>
          <Button
            label="Adicionar itens"
            variant="tonal"
            icon={Plus}
            onPress={() => setEditing(true)}
          />
        </Surface>
      )}

      {editing && hidden.length > 0 && (
        <View style={styles.addGroup}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            Adicionar à tela inicial
          </ThemedText>
          <View style={styles.chips}>
            {hidden.map((widget) => (
              <Chip
                key={widget.id}
                label={widget.label}
                icon={Plus}
                onPress={() => addWidget(widget.id)}
                accessibilityLabel={`Adicionar ${widget.label}`}
              />
            ))}
          </View>
        </View>
      )}
    </TabScreen>
  );
}

type EditableWidgetProps = {
  id: DashboardWidget;
  onRemove: () => void;
  children: ReactNode;
};

/**
 * A dashboard item while editing: a bar with its name and a remove button
 * above the card, all inside an outlined frame.
 */
function EditableWidget({ id, onRemove, children }: EditableWidgetProps) {
  const { colors } = useAppTheme();
  const widget = getWidgetInfo(id);
  const Icon = widget.icon;

  return (
    <View style={[styles.editFrame, { borderColor: colors.outlineVariant }]}>
      <View style={styles.editBar}>
        <Icon color={colors.onSurfaceVariant} size={20} aria-hidden />
        <ThemedText
          type="labelLarge"
          themeColor="onSurfaceVariant"
          numberOfLines={1}
          style={styles.editLabel}>
          {widget.label}
        </ThemedText>
        <IconButton
          icon={CircleMinus}
          color={colors.error}
          onPress={onRemove}
          accessibilityLabel={`Remover ${widget.label} da tela inicial`}
        />
      </View>
      {/* The card is only a preview here: its contents are not interactive. */}
      <View pointerEvents="none" style={styles.editContent}>
        {children}
      </View>
    </View>
  );
}

function EmptyIcon() {
  const { colors } = useAppTheme();
  return <LayoutDashboard color={colors.onSurfaceVariant} size={32} aria-hidden />;
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  editFrame: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: ComponentShape.card + Spacing.one,
    padding: Spacing.one,
  },
  editBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingLeft: Spacing.two,
  },
  editLabel: {
    flex: 1,
  },
  editContent: {
    flexGrow: 1,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.three,
  },
  emptyText: {
    textAlign: "center",
  },
  addGroup: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
});
