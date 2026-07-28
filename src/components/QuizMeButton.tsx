import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { fonts } from '../theme/typography';
import { useThemeColors } from '../theme/useThemeColors';

type Props = {
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Bottom-of-home invitation: a soft spotlight dock, not mixed into the word/level flow.
 */
export function QuizMeButton({ onPress }: Props) {
  const colors = useThemeColors();
  const enter = useSharedValue(0);
  const press = useSharedValue(1);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(
      120,
      withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }),
    );
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [enter, shimmer]);

  const shellStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * 22 },
      { scale: press.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + shimmer.value * 0.4,
    transform: [{ scale: 0.92 + shimmer.value * 0.08 }],
  }));

  return (
    <View style={styles.dock}>
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { backgroundColor: colors.beginnerSoft }, glowStyle]}
      />
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Quiz me"
        onPressIn={() => {
          press.value = withSpring(0.97, { damping: 16, stiffness: 280 });
        }}
        onPressOut={() => {
          press.value = withSpring(1, { damping: 10, stiffness: 200 });
        }}
        onPress={onPress}
        style={[
          styles.plate,
          {
            backgroundColor: colors.surface,
            borderColor: colors.beginner,
            shadowColor: colors.beginner,
          },
          shellStyle,
        ]}
      >
        <View style={[styles.accentRail, { backgroundColor: colors.beginner }]} />
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={[styles.eyebrow, { color: colors.beginner }]}>
              Stretch your vocabulary
            </Text>
            <Text style={[styles.title, { color: colors.ink }]}>Quiz me!</Text>
          </View>
          <View style={[styles.arrowOrb, { backgroundColor: colors.beginnerSoft }]}>
            <Text style={[styles.arrow, { color: colors.beginner }]}>→</Text>
          </View>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    marginTop: 'auto',
    paddingTop: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    bottom: 4,
    width: '92%',
    height: 64,
    borderRadius: 40,
  },
  plate: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  accentRail: {
    width: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fonts.bodySemi,
    marginBottom: 4,
  },
  title: {
    fontSize: 19,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
  },
  arrowOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 20,
    fontFamily: fonts.bodySemi,
    marginTop: -1,
  },
});
