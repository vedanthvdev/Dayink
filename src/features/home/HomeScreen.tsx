import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandedLoader } from '../../components/BrandedLoader';
import { LevelButton } from '../../components/LevelButton';
import { QuizMeButton } from '../../components/QuizMeButton';
import { SpeakWordButton } from '../../components/SpeakWordButton';
import type { ShownYearByWordId } from '../../domain/shownYear';
import { fonts } from '../../theme/typography';
import { useThemeColors } from '../../theme/useThemeColors';
import { LEVELS, LEVEL_LABEL, levelAccent } from './homeHelpers';
import { useHomeDaily } from './useHomeDaily';

type Props = {
  onOpenHistory: () => void;
  onOpenQuiz: () => void;
  onShownChange: (shown: ShownYearByWordId) => void;
};

export function HomeScreen({ onOpenHistory, onOpenQuiz, onShownChange }: Props) {
  const colors = useThemeColors();
  const { ready, level, today, error, onSelect } = useHomeDaily({ onShownChange });

  if (!ready) {
    return <BrandedLoader />;
  }

  const tip =
    Platform.OS === 'ios'
      ? 'Tip: add the Dayink widget to your Lock Screen.'
      : 'Tip: add the Dayink widget to your home screen (lock screen where supported).';

  const accent = levelAccent(today?.level ?? level, colors);
  const lockedLabel = today ? LEVEL_LABEL[today.level] : null;

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Text style={[styles.brand, { color: colors.ink }]}>Dayink</Text>
            <Pressable
              onPress={onOpenHistory}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Open history"
            >
              <Text style={[styles.historyLink, { color: colors.inkMuted }]}>History</Text>
            </Pressable>
          </View>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            One word a day. Pick your pace.
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <View style={[styles.accentBar, { backgroundColor: accent }]} />
            {today ? (
              <>
                <View style={styles.cardHeader}>
                  <Text style={[styles.todayLabel, { color: colors.inkMuted }]}>
                    Today · {lockedLabel}
                  </Text>
                  <SpeakWordButton word={today.word} />
                </View>
                <Text style={[styles.word, { color: colors.ink }]}>{today.word}</Text>
                <Text style={[styles.oneLiner, { color: colors.tip }]}>
                  {today.oneLiner}
                </Text>
                {today.example ? (
                  <Text style={[styles.example, { color: colors.inkMuted }]}>
                    {today.example}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={[styles.empty, { color: colors.inkMuted }]}>
                Choose a level to reveal today’s word.
              </Text>
            )}
          </View>

          <Text style={[styles.chooserLabel, { color: colors.inkMuted }]}>
            Choose a level
          </Text>
          <View style={styles.buttons}>
            {LEVELS.map((item, index) => (
              <LevelButton
                key={item}
                level={item}
                index={index}
                selected={level === item}
                onPress={onSelect}
              />
            ))}
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.hard }]}>{error}</Text>
          ) : null}

          <Text style={[styles.tip, { color: colors.inkMuted }]}>{tip}</Text>
          <Text style={[styles.privacy, { color: colors.inkMuted }]}>
            Privacy: words and progress stay on this device. Nothing is uploaded.
          </Text>

          <QuizMeButton onPress={onOpenQuiz} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    fontSize: 40,
    fontFamily: fonts.display,
    letterSpacing: -1,
    flexShrink: 1,
  },
  historyLink: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 28,
    paddingRight: 22,
    paddingTop: 22,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  todayLabel: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: fonts.bodySemi,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  word: {
    marginTop: 12,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.display,
  },
  oneLiner: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.body,
  },
  example: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
    fontStyle: 'italic',
  },
  empty: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.body,
  },
  chooserLabel: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 12,
    fontFamily: fonts.bodySemi,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  tip: {
    marginTop: 28,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.body,
  },
  error: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bodySemi,
  },
  privacy: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.body,
  },
});
