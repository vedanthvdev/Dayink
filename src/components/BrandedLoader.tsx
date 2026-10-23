import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../theme/typography';
import { useThemeColors } from '../theme/useThemeColors';

export function BrandedLoader() {
  const colors = useThemeColors();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.85 + pulse.value * 0.25 }],
  }));

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.root}
    >
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safe}>
        <Text style={[styles.brand, { color: colors.ink }]}>Dayink</Text>
        <Text style={[styles.caption, { color: colors.inkMuted }]}>
          Loading today’s word…
        </Text>
        <Animated.View
          style={[styles.dot, { backgroundColor: colors.ink }, dotStyle]}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 42,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  caption: {
    marginTop: 14,
    fontFamily: fonts.body,
    fontSize: 17,
  },
  dot: {
    marginTop: 28,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
