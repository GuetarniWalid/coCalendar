import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  width?: number;
  height?: number;
}

export const Profile: React.FC<IconProps> = ({ 
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
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
      />
    </Svg>
  );
};
