import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  width?: number;
  height?: number;
}

export const ChevronCompactUp: React.FC<IconProps> = ({ size = 24, color = 'currentColor', width, height }) => {
  const iconWidth = width || size;
  const iconHeight = height || size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox='0 0 24 24'>
      <Path fill='none' stroke={color} strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m4 13l8-3l8 3' />
    </Svg>
  );
};
