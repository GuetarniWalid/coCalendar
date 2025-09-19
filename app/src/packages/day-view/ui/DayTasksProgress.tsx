import { FC, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Rive, { AutoBind, RiveRef } from 'rive-react-native';

interface DayTasksProgressProps {
  progressPercentage: number;
  hasTasksToday: boolean;
}

const stateMachineName = 'State Machine Progression';
const resourceName = 'progression';
const artboardName = 'progression';

export const DayTasksProgress: FC<DayTasksProgressProps> = ({ progressPercentage, hasTasksToday }) => {
  const riveRef = useRef<RiveRef>(null);

  const percent = hasTasksToday ? progressPercentage : -1
  
  useEffect(() => {
    const rive = riveRef.current;
    if (!rive) return;
    rive.play()
    rive.setNumber('percent', percent)
  }, [percent])

  return (
    <View>
      <Rive
        ref={riveRef}
        resourceName={resourceName}
        artboardName={artboardName}
        stateMachineName={stateMachineName}
        style={styles.riveAnimation}
        autoplay={true}
        dataBinding={AutoBind(true)}
        onPlay={() => {
          const rive = riveRef.current;
          if (!rive) return;
          rive.setNumber('percent', percent)
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  riveAnimation: {
    width: 65,
    height: 65,
  },
});