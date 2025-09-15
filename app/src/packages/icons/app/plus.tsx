import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  width?: number;
  height?: number;
}

export const Plus: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  width,
  height 
}) => {
  const iconWidth = width || size;
  const iconHeight = height || size;

  return (
    <Svg 
      width={iconWidth} 
      height={iconHeight} 
      viewBox="0 0 19 19"
      fill="none"
    >
      <Rect x="7.78613" y="0.5" width="3.85714" height="18" rx="1.92857" fill={color} />
      <Rect x="0.5" y="11.2148" width="3.85714" height="18" rx="1.92857" transform="rotate(-90 0.5 11.2148)" fill={color} />
    </Svg>
  );
};
