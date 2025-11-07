import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { fontFamily } from '../theme/typography';

type FontWeight = '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  fontWeight?: FontWeight;
  style?: RNTextProps['style'];
}

const fontWeightMap: Record<FontWeight, string> = {
  '400': fontFamily.primary,
  'normal': fontFamily.primary,
  '500': fontFamily.medium,
  'medium': fontFamily.medium,
  '600': fontFamily.semibold,
  'semibold': fontFamily.semibold,
  '700': fontFamily.bold,
  'bold': fontFamily.bold,
  '800': fontFamily.extrabold,
  'extrabold': fontFamily.extrabold,
  '900': fontFamily.black,
  'black': fontFamily.black,
};

export const Text = ({ style, fontWeight, ...props }: TextProps) => {
  const fontFamilyStyle = fontWeight
    ? { fontFamily: fontWeightMap[fontWeight] }
    : styles.defaultFont;

  return <RNText style={[fontFamilyStyle, style]} {...props} />;
};

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: fontFamily.primary,
  },
});
