import { FC, useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Rive, { AutoBind, RiveRef } from 'rive-react-native';
import { SlotItem, calculateTaskCompletion } from '@project/shared';
import dayjs from 'dayjs';

interface DayTasksProgressProps {
  slots: SlotItem[];
  selectedDate: string;
}

const stateMachineName = 'State Machine Progression';
const resourceName = 'progression';
const artboardName = 'progression';

export const DayTasksProgress: FC<DayTasksProgressProps> = ({ slots, selectedDate }) => {
  const riveRef = useRef<RiveRef>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate progress based on real-time data
  const percent = useMemo(() => {
    // If slots haven't loaded yet (null/undefined), return 0 as initial state
    if (!slots) {
      return 0;
    }
    
    // If slots are loaded but empty array, return -1 for "no work" state
    if (slots.length === 0) {
      return -1;
    }
    
    const progressData = calculateTaskCompletion(slots, selectedDate);
    return progressData.percentage;
  }, [slots, selectedDate, currentTime]);

  // Set up real-time tracking for slots that haven't ended yet
  useEffect(() => {
    const now = new Date();
    const currentDate = dayjs().format('YYYY-MM-DD');
    
    // Only track if viewing today's slots and slots are loaded
    if (selectedDate !== currentDate || !slots || slots.length === 0) {
      return;
    }

    // Find the next slot to end
    const upcomingSlots = slots.filter(slot => {
      if (slot.completed) return false;
      const endTime = new Date(slot.endTime);
      return endTime > now;
    });

    if (upcomingSlots.length === 0) {
      return;
    }

    // Find the earliest ending slot
    const nextSlotToEnd = upcomingSlots.reduce((earliest, slot) => {
      const slotEndTime = new Date(slot.endTime);
      const earliestEndTime = new Date(earliest.endTime);
      return slotEndTime < earliestEndTime ? slot : earliest;
    });

    const timeUntilEnd = new Date(nextSlotToEnd.endTime).getTime() - now.getTime();
    
    if (timeUntilEnd > 0) {
      const timeout = setTimeout(() => {
        setCurrentTime(new Date());
      }, timeUntilEnd);

      return () => clearTimeout(timeout);
    }
    
    return undefined;
  }, [slots, selectedDate, currentTime]);
  
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