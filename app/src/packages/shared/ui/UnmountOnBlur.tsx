import { ReactNode } from 'react';
import { useIsFocused } from '@react-navigation/native';

interface UnmountOnBlurProps {
  children: ReactNode;
}

export function UnmountOnBlur({ children }: UnmountOnBlurProps) {
  const isFocused = useIsFocused();

  if (!isFocused) {
    return null;
  }

  return <>{children}</>;
}