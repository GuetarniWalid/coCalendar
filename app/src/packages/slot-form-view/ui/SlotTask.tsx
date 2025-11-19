import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  RefObject,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
  Keyboard,
} from 'react-native';
import { fontSize, colors, SlotTask as SlotTaskType, SlotItem, getSlotContrastColor, useReliableKeyboard } from '@project/shared';
import { useTranslation } from '@project/i18n';
import { Check } from '@project/icons';
import Animated, {
  useAnimatedReaction,
  useAnimatedRef,
  measure,
  useSharedValue,
} from 'react-native-reanimated';

const generateTaskId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

interface SlotTaskProps {
  task: SlotTaskType;
  slot: SlotItem
  handleAddTask: (task: SlotTaskType) => void;
  handleRemoveTask: (task: SlotTaskType) => void;
  focusOtherTask: (task: SlotTaskType, direction: 'next' | 'previous') => void;
  scrollToY: (y: any) => void;
  messageInputRef: RefObject<TextInput | null>;
  isLastTask: boolean;
  isNewTask: boolean;
  isNextTaskEmpty: boolean;
  onTaskCreated: (tempId: string, createdTask: SlotTaskType) => void;
  onTaskUpdated: (taskId: string, updates: Partial<SlotTaskType>) => void;
  focusOnLayout?: boolean;
}

export interface SlotTaskRef {
  focus: () => void;
}

const screenHeight = Dimensions.get('window').height;

export const SlotTask = forwardRef<SlotTaskRef, SlotTaskProps>(
  (
    {
      task,
      slot,
      handleAddTask,
      handleRemoveTask,
      focusOtherTask,
      scrollToY,
      messageInputRef,
      isLastTask,
      isNewTask,
      isNextTaskEmpty,
      onTaskCreated,
      onTaskUpdated,
      focusOnLayout = false,
    },
    ref
  ) => {
    const t = useTranslation();

    const taskText = task?.text || '';
    const taskDone = task?.is_done || false;
    const defaultPlaceholder = t.addTask;
    const slotContrastColor = getSlotContrastColor(slot.color)

    const [text, setText] = useState(taskText);
    const [isDone, setIsDone] = useState(taskDone);
    const [isFocusedState, setIsFocusedState] = useState(false);
    const isFocused = useSharedValue(false);

    // Sync internal state when task prop changes (e.g., after cache refresh)
    useEffect(() => {
      if (task?.text !== text) {
        setText(task?.text || '');
      }
      if (task?.is_done !== isDone) {
        setIsDone(task?.is_done || false);
      }
    }, [task?.text, task?.is_done]);

    const inputRef = useRef<TextInput>(null);
    const containerRef = useAnimatedRef<View>();
    const keyboard = useReliableKeyboard();
    const isSubmittingRef = useRef(false);
    const hasScrolledForCurrentFocus = useSharedValue(false);

    useEffect(() => {
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          inputRef.current?.blur();
        }
      );

      return () => {
        keyboardDidHideListener.remove();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const handleBlur = () => {
      isFocused.value = false;
      setIsFocusedState(false);
      hasScrolledForCurrentFocus.value = false;
      if (isSubmittingRef.current) {
        isSubmittingRef.current = false;
        return;
      }

      const trimmed = text.trim();
      if (trimmed !== task.text && task.id && !isNewTask) {
        onTaskUpdated(task.id, { text: trimmed });
        return;
      }

      if (isNewTask && trimmed) {
        const createdTask: SlotTaskType = {
          id: generateTaskId(),
          text: trimmed,
          is_done: isDone,
          position: task.position,
        };
        if (task.id) {
          onTaskCreated(task.id, createdTask);
        }
      }
    };

    const handleSubmitEditing = () => {
      isSubmittingRef.current = true;
      isFocused.value = false;
      setIsFocusedState(false);
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 0);

      const trimmed = text.trim();
      const taskUpdated = { ...task, text: trimmed };

      if (isLastTask && !trimmed) {
        messageInputRef.current?.focus();
        handleRemoveTask(task);
        return;
      }

      if (!trimmed && isNewTask) {
        focusOtherTask(task, 'next');
        return;
      }

      if (!trimmed && !isNewTask) {
        focusOtherTask(task, 'next');
        return;
      }

      if (trimmed && isNewTask) {
        const createdTask: SlotTaskType = {
          id: generateTaskId(),
          text: trimmed,
          is_done: isDone,
          position: task.position,
        };

        if (task.id) {
          onTaskCreated(task.id, createdTask);
        }

        if (isNextTaskEmpty) {
          focusOtherTask(task, 'next');
          return;
        }
        handleAddTask(taskUpdated);
        return;
      }

      if (trimmed && !isNewTask) {
        if (task.text !== trimmed) {
          onTaskUpdated(task.id, { text: trimmed });
        }
        if (isNextTaskEmpty) {
          focusOtherTask(task, 'next');
          return;
        }
        handleAddTask(taskUpdated);
        return;
      }
    };

    const handleKeyPress = (e: any) => {
      const key = e.nativeEvent.key;

      if (key === 'Backspace' && text.trim() === '' && task) {
        focusOtherTask(task, 'previous');
        handleRemoveTask(task);
      }
    };

    const handleCheckPress = () => {
      if (!task) return;

      const newDoneState = !isDone;
      setIsDone(newDoneState);

      if (task.id) {
        onTaskUpdated(task.id, { is_done: newDoneState });
      }
    };

    useAnimatedReaction(
      () => ({ focused: isFocused.value, keyboardState: keyboard.state.value }),
      (current, previous) => {
        if (!current.focused) return;
        if (current.keyboardState !== 'shown') return;
        if (hasScrolledForCurrentFocus.value) return;

        if (previous && current.focused === previous.focused && current.keyboardState === previous.keyboardState) {
          return;
        }

        const measurement = measure(containerRef);
        if (!measurement) return;

        const taskBottomY = measurement.pageY + measurement.height;
        const keyboardTopY = screenHeight - keyboard.height.value;
        const desiredPadding = 100;

        const shouldScroll = taskBottomY > keyboardTopY - desiredPadding;
        if (!shouldScroll) return;

        const distanceToScroll = taskBottomY - keyboardTopY + desiredPadding;
        scrollToY(distanceToScroll);
        hasScrolledForCurrentFocus.value = true;
      }
    );

    const handleLayout = () => {
      if (focusOnLayout) {
        // Double RAF ensures focus happens after all layout adjustments complete
        // 1st RAF: waits for next render frame after this component's layout
        // 2nd RAF: ensures parent ScrollView and sibling components have settled
        // This prevents measuring stale positions in useAnimatedReaction
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        });
      }
    };

    return (
      <Animated.View
        ref={containerRef}
        style={styles.container}
        onLayout={handleLayout}
      >
        <Pressable
          onPress={handleCheckPress}
          style={[
            styles.checkboxContainer,
            {borderColor: slotContrastColor},
            isDone
              ? { backgroundColor: slotContrastColor }
              : {},
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
        >
          {isDone && (
            <View style={styles.checkSVGContainer}>
              <Check size={10} color={colors.background.primary} />
            </View>
          )}
        </Pressable>
        <Pressable
          style={{ flex: 1, marginTop: 4 }}
          onPress={() => inputRef.current?.focus()}
          hitSlop={{ top: 10, bottom: 10 }}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              isDone && {
                opacity: 0.8,
                textDecorationLine: 'line-through',
              },
            ]}
            value={text}
            onChangeText={setText}
            onFocus={() => {
              isFocused.value = true;
              setIsFocusedState(true);
            }}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSubmitEditing}
            placeholder={defaultPlaceholder}
            placeholderTextColor={colors.typography.secondary}
            spellCheck={isFocusedState}
            autoCorrect={isFocusedState}
            multiline
            textAlignVertical="top"
            submitBehavior="submit"
            returnKeyType="done"
          />
        </Pressable>
      </Animated.View>
    );
  }
);

SlotTask.displayName = 'SlotTask';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.typography.secondary,
  },
  checkSVGContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.4,
    color: colors.typography.primary,
    padding: 0,
    minHeight: 20,
  },
});
