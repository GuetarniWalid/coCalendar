import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  outlineColor?: string;
  width?: number;
  height?: number;
}

export const TaskChecked: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  width,
  height,
  outlineColor = 'white',
}) => {
  // Original SVG dimensions from viewBox
  const originalWidth = 23;
  const originalHeight = 53;
  const aspectRatio = originalWidth / originalHeight;

  // Calculate dimensions maintaining aspect ratio
  let iconWidth: number;
  let iconHeight: number;

  if (width && height) {
    // Use explicit width/height if both provided
    iconWidth = width;
    iconHeight = height;
  } else if (width) {
    // Scale by width, calculate height
    iconWidth = width;
    iconHeight = width / aspectRatio;
  } else if (height) {
    // Scale by height, calculate width
    iconHeight = height;
    iconWidth = height * aspectRatio;
  } else {
    // Scale by size, use height as the constraint (since it's taller)
    iconHeight = size;
    iconWidth = size * aspectRatio;
  }

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 23 53" fill="none">
      <Path
        d="M22.6991 15.9923C22.6991 8.99228 16.724 4.99229 11.6991 4.99229C5.53879 4.99229 5.22508e-05 6.5 5.22584e-05 0L0 53C0 53 0.5 28.1122 11.6991 26.9923C16.6991 26.4923 22.6991 22.9923 22.6991 15.9923Z"
        fill={outlineColor}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.6987 25C12.8806 25 14.051 24.7672 15.1429 24.3149C16.2348 23.8626 17.227 23.1997 18.0627 22.364C18.8984 21.5282 19.5614 20.5361 20.0136 19.4442C20.4659 18.3522 20.6987 17.1819 20.6987 16C20.6987 14.8181 20.4659 13.6478 20.0136 12.5558C19.5614 11.4639 18.8984 10.4718 18.0627 9.63604C17.227 8.80031 16.2348 8.13738 15.1429 7.68508C14.051 7.23279 12.8806 7 11.6987 7C9.31178 7 7.0226 7.94821 5.33477 9.63604C3.64694 11.3239 2.69873 13.6131 2.69873 16C2.69873 18.3869 3.64694 20.6761 5.33477 22.364C7.0226 24.0518 9.31178 25 11.6987 25ZM11.4667 19.64L15.8267 14.408C16.1802 13.9839 16.1229 13.3534 15.6987 13V13C15.2745 12.6465 14.6442 12.7038 14.2907 13.1279L10.9033 17.192C10.7569 17.3676 10.4914 17.3796 10.3298 17.2179L9.11265 16.0002C8.72226 15.6097 8.08913 15.6096 7.69865 16.0001V16.0001C7.30823 16.3905 7.30823 17.0235 7.69865 17.4139L9.99173 19.707V19.707C10.4074 20.1227 11.0904 20.0915 11.4667 19.64V19.64Z"
        fill={color}
      />
    </Svg>
  );
};
