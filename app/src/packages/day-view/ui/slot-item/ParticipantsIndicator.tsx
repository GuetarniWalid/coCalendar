import { FC, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  SlotParticipant,
  SlotColorName,
  getSlotParticipantColors,
} from '@project/shared';
import { colors, fontSize, fontWeight } from '@project/shared';

interface ParticipantsIndicatorProps {
  participants?: SlotParticipant[];
  slotColor?: SlotColorName;
}

// Generate initials from display_name or email
const generateInitials = (participant: SlotParticipant): string => {
  // Helper function to extract initials from text parts
  const getInitialsFromParts = (parts: string[]): string => {
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    } else if (parts.length === 1) {
      return parts[0]![0]!.toUpperCase();
    }
    return '';
  };

  // Try display_name first
  if (participant.display_name?.trim()) {
    const nameParts = participant.display_name
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const initials = getInitialsFromParts(nameParts);
    if (initials) return initials;
  }

  // Fallback to email
  if (participant.email) {
    const emailParts =
      participant.email.split('@')[0]?.split('.').filter(Boolean) || [];
    const initials = getInitialsFromParts(emailParts);
    if (initials) return initials;
  }

  // Final fallback - use user_id
  if (participant.user_id?.length >= 2) {
    return participant.user_id.substring(0, 2).toUpperCase();
  }

  return '??';
};

const MAX_VISIBLE_PARTICIPANTS = 3;
const PARTICIPANT_OVERLAP = -9;

export const ParticipantsIndicator: FC<ParticipantsIndicatorProps> = ({
  participants,
  slotColor,
}) => {
  const participantData = useMemo(() => {
    if (!participants?.length)
      return { items: [], showOverflow: false, overflowCount: 0 };

    // Sort participants by created_at (oldest first) for consistent ordering
    const sortedParticipants = [...participants].sort((a, b) => {
      if (!a.created_at || !b.created_at) return 0;
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    const participantColors = getSlotParticipantColors(
      slotColor,
      sortedParticipants.length
    );
    const showOverflow = sortedParticipants.length > MAX_VISIBLE_PARTICIPANTS;
    const visibleParticipants = sortedParticipants.slice(
      0,
      MAX_VISIBLE_PARTICIPANTS
    );

    const items = visibleParticipants.map((participant, index) => ({
      id: participant.user_id,
      initials: generateInitials(participant),
      color: participantColors[index] || colors.primary,
      zIndex: visibleParticipants.length - index, // Stack order: first participant on top
    }));

    return {
      items,
      showOverflow,
      overflowCount: sortedParticipants.length - MAX_VISIBLE_PARTICIPANTS,
    };
  }, [participants, slotColor]);

  if (!participantData.items.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {participantData.showOverflow && (
        <View
          style={[
            styles.participantCircle,
            styles.overflowCircle,
            {
              zIndex: 999, // Above all participants
              marginLeft:
                participantData.items.length > 0 ? PARTICIPANT_OVERLAP : 0,
            },
          ]}
        >
          <Text style={styles.overflowText}>
            +{participantData.overflowCount}
          </Text>
        </View>
      )}
      {participantData.items.map((participant, index) => (
        <View
          key={participant.id}
          style={[
            styles.participantCircle,
            {
              backgroundColor: participant.color,
              zIndex: participant.zIndex,
              marginLeft:
                participantData.showOverflow || index > 0
                  ? PARTICIPANT_OVERLAP
                  : 0,
            },
          ]}
        >
          <Text style={styles.initialsText}>{participant.initials}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  participantCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowCircle: {
    backgroundColor: colors.typography.primary,
  },
  initialsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
    textAlign: 'center',
  },
  overflowText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
});
