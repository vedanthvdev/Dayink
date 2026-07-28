import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { catalogs } from '../domain/catalog';
import { historyForCurrentYear, type ShownYearByWordId } from '../domain/shownYear';
import type { Level } from '../domain/types';
import { fonts } from '../theme/typography';
import { useThemeColors } from '../theme/useThemeColors';

const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  hard: 'Hard',
};

type Props = {
  shownYearByWordId: ShownYearByWordId;
  onBack: () => void;
};

export function HistoryScreen({ shownYearByWordId, onBack }: Props) {
  const colors = useThemeColors();
  const year = new Date().getFullYear();
  const rows = historyForCurrentYear(shownYearByWordId, catalogs, new Date());

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
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <Text style={[styles.back, { color: colors.inkMuted }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.ink }]}>History</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Words you’ve unlocked in {year}.
          </Text>

          {rows.length === 0 ? (
            <Text style={[styles.empty, { color: colors.inkMuted }]}>
              No words yet this year. Today’s word will show up here once it’s locked.
            </Text>
          ) : (
            rows.map((row) => (
              <View
                key={row.wordId}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.surfaceBorder,
                  },
                ]}
              >
                <Text style={[styles.level, { color: colors.inkMuted }]}>
                  {LEVEL_LABEL[row.level]}
                </Text>
                <Text style={[styles.word, { color: colors.ink }]}>{row.word}</Text>
                <Text style={[styles.oneLiner, { color: colors.tip }]}>{row.oneLiner}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 36,
  },
  back: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
    marginBottom: 18,
  },
  title: {
    fontSize: 40,
    fontFamily: fonts.display,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  empty: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.body,
  },
  row: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  level: {
    fontSize: 12,
    fontFamily: fonts.bodySemi,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  word: {
    marginTop: 6,
    fontSize: 24,
    fontFamily: fonts.display,
  },
  oneLiner: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.body,
  },
});
