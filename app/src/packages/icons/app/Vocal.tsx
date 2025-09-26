import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const Vocal: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => {
  const iconHeight = size;
  const iconWidth = size * (17 / 14); // Preserve aspect ratio from viewBox

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox='0 0 17 14' fill='none'>
      <Path
        d='M0.791016 6.05592L0.799724 8.28169M2.38781 3.68884L2.33991 10.454M4.16945 0.974609L4.15837 13.116M5.96179 3.78978L5.94833 10.4647M7.66466 5.40082L7.68762 8.88613M9.2757 3.74742L9.23137 10.4232M11.1373 5.41546L11.1171 8.55086M12.9015 3.8448L12.8936 10.3095M14.6705 5.48434L14.6598 8.7373M16.2091 6.18932L16.2289 7.9294'
        stroke={color}
        strokeWidth='0.666667'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
};
