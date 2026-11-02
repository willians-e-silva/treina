import { Stack, useLocalSearchParams } from 'expo-router';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import SendHorizontal from 'lucide-react-native/icons/send-horizontal';
import { useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TrainerAvatar } from '@/components/trainers/trainer-avatar';
import { IconButton } from '@/components/ui/icon-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useChat, type ChatMessage } from '@/context/chat';
import { getTrainer } from '@/lib/trainers';
import { Shape, useAppTheme } from '@/theme';

/** Line height of the message being typed. */
const INPUT_LINE = 22;
/** The composer grows up to this many lines, then scrolls. */
const INPUT_MAX_LINES = 5;
/** Vertical padding of the composer pill: one line is as tall as the send button. */
const INPUT_PADDING = 13;

const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Direct conversation with a trainer. */
export default function ChatScreen() {
  const { colors, typography } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { trainerId } = useLocalSearchParams<{ trainerId: string }>();
  const trainer = getTrainer(trainerId);
  const { messagesWith, sendMessage } = useChat();
  const [draft, setDraft] = useState('');
  // Height of the whole text (the padding is on the pill), at least one line.
  const [inputHeight, setInputHeight] = useState(INPUT_LINE);
  const maxInputHeight = INPUT_LINE * INPUT_MAX_LINES;
  const inputScroll = useRef<ScrollViewInstance>(null);
  // Shared by the input and the hidden copy that measures it.
  const inputFont = {
    fontSize: typography.bodyLarge.fontSize,
    letterSpacing: typography.bodyLarge.letterSpacing,
  };
  const keyboard = useAnimatedKeyboard();

  // Lifts the composer with the keyboard; the bottom inset is under the keyboard then.
  const keyboardSpacer = useAnimatedStyle(() => ({
    height: Math.max(keyboard.height.get(), insets.bottom),
  }));

  if (!trainer) {
    return (
      <View style={styles.missing}>
        <ThemedText themeColor="onSurfaceVariant">Treinador não encontrado.</ThemedText>
      </View>
    );
  }

  const messages = messagesWith(trainer.id);
  // Inverted list: newest at the bottom, next to the composer.
  const data = [...messages].reverse();

  function send() {
    if (!trainer || !draft.trim()) return;
    sendMessage(trainer.id, draft);
    setDraft('');
    setInputHeight(INPUT_LINE);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} size={36} />
              <View style={styles.flex}>
                <ThemedText type="titleMedium" emphasized numberOfLines={1}>
                  {trainer.name}
                </ThemedText>
                <ThemedText type="bodySmall" themeColor="onSurfaceVariant" numberOfLines={1}>
                  {trainer.specialty}
                </ThemedText>
              </View>
            </View>
          ),
        }}
      />

      <FlatList
        inverted
        data={data}
        keyExtractor={(message) => message.id}
        renderItem={({ item }) => <Bubble message={item} />}
        style={styles.flex}
        contentContainerStyle={[styles.list, data.length === 0 && styles.listEmpty]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          // The list is inverted, so its empty component is too.
          <View style={[styles.empty, styles.flipped]}>
            <MessageCircle color={colors.outlineVariant} size={72} strokeWidth={1.5} aria-hidden />
            <ThemedText themeColor="onSurfaceVariant" style={styles.center}>
              Envie uma mensagem para {trainer.name.split(' ')[0]} e tire suas dúvidas sobre os
              treinos.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.composer, { borderTopColor: colors.outlineVariant }]}>
        <View style={styles.composerInner}>
          <View style={[styles.pill, { backgroundColor: colors.surfaceContainerHigh }]}>
            {/* Like Instagram: one line tall, growing and shrinking as the text
                wraps. The input's own content size does not shrink on Android,
                so a hidden copy of the text, as wide as the input, measures it. */}
            <ThemedText
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onLayout={(event) =>
                setInputHeight(Math.max(Math.ceil(event.nativeEvent.layout.height), INPUT_LINE))
              }
              style={[styles.input, styles.measure, inputFont]}>
              {/* A trailing line break only counts as a line with something after it. */}
              {draft.endsWith('\n') ? `${draft} ` : draft}
            </ThemedText>
            {/* The input never scrolls itself (it has no prop to hide its scroll bar):
                it takes the whole text's height inside a scroll view without one. */}
            <ScrollView
              ref={inputScroll}
              style={{ height: Math.min(inputHeight, maxInputHeight) }}
              scrollEnabled={inputHeight > maxInputHeight}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              // Keeps the line being typed in view as the text grows.
              onContentSizeChange={() => inputScroll.current?.scrollToEnd({ animated: false })}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Mensagem"
                placeholderTextColor={colors.onSurfaceVariant}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
                multiline
                maxLength={1000}
                accessibilityLabel={`Mensagem para ${trainer.name}`}
                scrollEnabled={false}
                textAlignVertical="top"
                style={[styles.input, inputFont, { height: inputHeight, color: colors.onSurface }]}
              />
            </ScrollView>
          </View>
          <IconButton
            icon={SendHorizontal}
            variant="filled"
            disabled={!draft.trim()}
            onPress={send}
            accessibilityLabel="Enviar mensagem"
          />
        </View>
      </View>
      <Animated.View style={keyboardSpacer} />
    </View>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const { colors } = useAppTheme();
  const mine = message.from === 'me';

  return (
    <View
      style={[styles.bubbleRow, mine ? styles.mine : styles.theirs]}
      accessible
      accessibilityLabel={`${mine ? 'Você' : 'Treinador'}, ${time.format(message.sentAt)}: ${message.text}`}>
      <View
        style={[
          styles.bubble,
          mine
            ? {
                backgroundColor: colors.secondaryContainer,
                borderBottomRightRadius: Shape.extraSmall,
              }
            : {
                backgroundColor: colors.surfaceContainerHigh,
                borderBottomLeftRadius: Shape.extraSmall,
              },
        ]}>
        <ThemedText themeColor={mine ? 'onSecondaryContainer' : 'onSurface'}>
          {message.text}
        </ThemedText>
        <ThemedText
          type="labelSmall"
          themeColor={mine ? 'onSecondaryContainer' : 'onSurfaceVariant'}
          style={styles.time}>
          {time.format(message.sentAt)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    // Leaves room for the back button.
    maxWidth: '85%',
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  listEmpty: {
    flexGrow: 1,
  },
  flipped: {
    transform: [{ scaleY: -1 }],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  mine: {
    justifyContent: 'flex-end',
  },
  theirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Shape.large,
  },
  time: {
    alignSelf: 'flex-end',
    marginTop: 2,
    opacity: 0.8,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  composerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  pill: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: INPUT_PADDING + INPUT_LINE / 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: INPUT_PADDING,
  },
  measure: {
    position: 'absolute',
    // Same width as the input: the pill's content box.
    left: Spacing.three,
    right: Spacing.three,
    top: INPUT_PADDING,
    opacity: 0,
  },
  input: {
    lineHeight: INPUT_LINE,
    // No padding of its own, so it lines up with the copy that measures it.
    padding: 0,
    // Android adds room above and below the text otherwise.
    includeFontPadding: false,
  },
});
