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

  function getTriggerForProgress(percentage: number, hasTasks: boolean) {
    if (!hasTasks) {
      return 'trigger sleep';
    }

    // Round to the nearest 10% step
    const roundedProgress = Math.floor(percentage / 10) * 10;
    return 'trigger ' + roundedProgress;
  };

  // Compute the trigger name based on progress/hasTasks
  const currentTrigger = getTriggerForProgress(progressPercentage, hasTasksToday);
  
  useEffect(() => {
    const rive = riveRef.current;
    if (!rive) return;
    rive.trigger(currentTrigger)
  }, [currentTrigger])

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
          rive.trigger(currentTrigger)
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