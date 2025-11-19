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
import { fontSize, colors, SlotTask as SlotTaskType, SlotItem, getSlotContrastColor } from '@project/shared';
import { useTranslation } from '@project/i18n';
import { Check } from '@project/icons';
import Animated, {
  useAnimatedReaction,
  useAnimatedRef,
  measure,
  useAnimatedKeyboard,
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
    const [isFocused, setIsFocused] = useState(false);

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
    const keyboard = useAnimatedKeyboard();
    const isSubmittingRef = useRef(false);

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
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);

      const trimmed = text.trim();
      setIsFocused(false);
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
      () => keyboard.state.value,
      keyboardState => {
        if (!isFocused) return;
        if (keyboardState != 2) return;

        const measurement = measure(containerRef);
        if (!measurement) return;
        const distanceToScroll =
          measurement?.pageY - (screenHeight - keyboard.height.value) + 40;
        scrollToY(distanceToScroll);
      }
    );

    return (
      <Animated.View
        ref={containerRef}
        style={styles.container}
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
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSubmitEditing}
            placeholder={defaultPlaceholder}
            placeholderTextColor={colors.typography.secondary}
            spellCheck={isFocused}
            autoCorrect={isFocused}
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
