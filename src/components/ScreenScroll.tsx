import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Reading column for iPhone Duo.
 * The gradient runs edge to edge. SafeAreaView applies the rail and status
 * insets on every platform; the scroll view does not add a second iOS inset.
 * The column stops widening once the inner display is open.
 */
const READABLE_MAX_WIDTH = 640;

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
};

export function ScreenScroll({ children, style, keyboardShouldPersistTaps }: Props) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safe}>
        <View style={[styles.column, style]}>{children}</View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  safe: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: READABLE_MAX_WIDTH,
    alignSelf: 'center',
  },
});
