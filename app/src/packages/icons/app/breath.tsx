import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  width?: number;
  height?: number;
}

export const Breath: React.FC<IconProps> = ({ 
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
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path 
        fill={color} 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
      />
    </Svg>
  );
};
