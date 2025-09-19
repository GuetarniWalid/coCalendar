import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore, useSlotFormStore } from '@project/shared';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';
 
import { AppLayout } from '@project/app-layout';
import { SlotForm } from './components/SlotForm';

const SlotFormScreen = () => {
  const navigation = useNavigation<any>();
  const t = useTranslation();
  const [supabase] = useAuthStore.supabase();

  // Get slot form data from Teaful store
  const [selectedDate] = useSlotFormStore.selectedDate();
  const [selectedSlot] = useSlotFormStore.selectedSlot();

  // Safety check - if no selectedDate, go back
  useEffect(() => {
    if (!selectedDate) {
      navigation.goBack();
    }
  }, [selectedDate, navigation]);

  if (!selectedDate) {
    return null;
  }
  const [title, setTitle] = useState(selectedSlot?.title ?? '');
  const [startTime, setStartTime] = useState(() => {
    if (selectedSlot?.startTime) return dayjs(selectedSlot.startTime).format('HH:mm');
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [endTime, setEndTime] = useState(() => {
    if (selectedSlot?.endTime) return dayjs(selectedSlot.endTime).format('HH:mm');
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    return end.toTimeString().slice(0, 5);
  });

  // When slot selection changes in store, reinitialize local state
  useEffect(() => {
    if (!selectedSlot) return;
    setTitle(selectedSlot.title ?? '');
    setStartTime(selectedSlot.startTime ? dayjs(selectedSlot.startTime).format('HH:mm') : startTime);
    setEndTime(selectedSlot.endTime ? dayjs(selectedSlot.endTime).format('HH:mm') : endTime);
  }, [selectedSlot, supabase]);


  // Drag-to-collapse gesture state
  const onClose = () => navigation.goBack();

  return (
    <AppLayout activeTab='today'>
      <SlotForm
        startTime={startTime}
        endTime={endTime}
        title={title}
        setTitle={setTitle}
        titlePlaceholder={t.titleLabel}
        onClose={onClose}
      />
    </AppLayout>
  );
};

SlotFormScreen.options = {
  topBar: { visible: false },
};

export default SlotFormScreen;
