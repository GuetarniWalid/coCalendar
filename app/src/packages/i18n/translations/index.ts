import { SupportedLocale } from '../locale';

export interface Translations {
  // Day View
  addTask: string;
  noSlotsForDay: string;
  tapToAddSlot: string;
  emptyDayTitle: string; // Title for empty day card
  emptyDayText: string;  // Subtitle/text for empty day card
  
  // Common
  loading: string;
  error: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  saving: string;
  newSlot: string;
  editSlot: string;
  
  // Navigation
  today: string;
  calendar: string;
  profile: string;
  
  // Time
  startTime: string;
  endTime: string;
  
  // Progress time remaining
  remainingPrefix: string; // "Encore" / "Still" / etc.
  minutesSingular: string; // "minute"
  minutesPlural: string; // "minutes" / "min"
  secondsSingular: string; // "seconde" 
  secondsPlural: string; // "secondes"

  // Slot form labels
  titleLabel: string;
  timeLabel: string;
  startLabel: string;
  endLabel: string;
  visibilityLabel: string;
  privateLabel: string;
  publicLabel: string;
  slotColorLabel: string;
  descriptionOptionalLabel: string;
  addMessage?: string;
}

export const translations: Record<SupportedLocale, Translations> = {
  en: {
    // Day View
    addTask: 'Add a thing to do',
    noSlotsForDay: 'No slots for this day',
    tapToAddSlot: 'Tap the + button to add a new slot',
    emptyDayTitle: 'Rest',
    emptyDayText: 'No activity',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    saving: 'Saving...',
    newSlot: 'New Slot',
    editSlot: 'Edit Slot',
    
    // Navigation
    today: 'Today',
    calendar: 'Calendar',
    profile: 'Profile',
    
    // Time
    startTime: 'Start Time',
    endTime: 'End Time',
    
    // Progress time remaining
    remainingPrefix: 'Still',
    minutesSingular: 'minute',
    minutesPlural: 'min',
    secondsSingular: 'second',
    secondsPlural: 'seconds',
    
    // Slot form labels
    titleLabel: 'Title',
    timeLabel: 'Time',
    startLabel: 'Start',
    endLabel: 'End',
    visibilityLabel: 'Visibility',
    privateLabel: 'Private',
    publicLabel: 'Public',
    slotColorLabel: 'Slot color',
    descriptionOptionalLabel: 'Description (Optional)',
    addMessage: 'Add a message',
  },
  fr: {
    // Day View
    addTask: 'Ajouter une chose à faire',
    noSlotsForDay: 'Aucun créneau pour ce jour',
    tapToAddSlot: 'Appuyez sur le bouton + pour ajouter un nouveau créneau',
    emptyDayTitle: 'Repos',
    emptyDayText: 'Pas d’activitée',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    saving: 'Enregistrement...',
    newSlot: 'Nouveau créneau',
    editSlot: 'Modifier le créneau',
    
    // Navigation
    today: 'Aujourd\'hui',
    calendar: 'Calendrier',
    profile: 'Profil',
    
    // Time
    startTime: 'Heure de début',
    endTime: 'Heure de fin',
    
    // Progress time remaining
    remainingPrefix: 'Encore',
    minutesSingular: 'minute',
    minutesPlural: 'min',
    secondsSingular: 'seconde',
    secondsPlural: 'secondes',
    
    // Slot form labels
    titleLabel: 'Titre',
    timeLabel: 'Heure',
    startLabel: 'Début',
    endLabel: 'Fin',
    visibilityLabel: 'Visibilité',
    privateLabel: 'Privé',
    publicLabel: 'Public',
    slotColorLabel: 'Couleur du créneau',
    descriptionOptionalLabel: 'Description (Optionnel)',
    addMessage: 'Ajouter un message',
  },
  es: {
    // Day View
    addTask: 'Agregar una cosa que hacer',
    noSlotsForDay: 'No hay espacios para este día',
    tapToAddSlot: 'Toca el botón + para agregar un nuevo espacio',
    emptyDayTitle: 'Descanso',
    emptyDayText: 'Sin actividad',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    saving: 'Guardando...',
    newSlot: 'Nuevo espacio',
    editSlot: 'Editar espacio',
    
    // Navigation
    today: 'Hoy',
    calendar: 'Calendario',
    profile: 'Perfil',
    
    // Time
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    
    // Progress time remaining
    remainingPrefix: 'Quedan',
    minutesSingular: 'minuto',
    minutesPlural: 'min',
    secondsSingular: 'segundo',
    secondsPlural: 'segundos',
    
    // Slot form labels
    titleLabel: 'Título',
    timeLabel: 'Hora',
    startLabel: 'Inicio',
    endLabel: 'Fin',
    visibilityLabel: 'Visibilidad',
    privateLabel: 'Privado',
    publicLabel: 'Público',
    slotColorLabel: 'Color del espacio',
    descriptionOptionalLabel: 'Descripción (Opcional)',
    addMessage: 'Añadir un mensaje',
  },
  de: {
    // Day View
    addTask: 'Eine Sache hinzufügen',
    noSlotsForDay: 'Keine Termine für diesen Tag',
    tapToAddSlot: 'Tippen Sie auf die + Schaltfläche, um einen neuen Termin hinzuzufügen',
    emptyDayTitle: 'Ruhe',
    emptyDayText: 'Keine Aktivität',
    
    // Common
    loading: 'Laden...',
    error: 'Fehler',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    saving: 'Speichern...',
    newSlot: 'Neuer Termin',
    editSlot: 'Termin bearbeiten',
    
    // Navigation
    today: 'Heute',
    calendar: 'Kalender',
    profile: 'Profil',
    
    // Time
    startTime: 'Startzeit',
    endTime: 'Endzeit',
    
    // Progress time remaining
    remainingPrefix: 'Noch',
    minutesSingular: 'Minute',
    minutesPlural: 'Min',
    secondsSingular: 'Sekunde',
    secondsPlural: 'Sekunden',
    
    // Slot form labels
    titleLabel: 'Titel',
    timeLabel: 'Zeit',
    startLabel: 'Start',
    endLabel: 'Ende',
    visibilityLabel: 'Sichtbarkeit',
    privateLabel: 'Privat',
    publicLabel: 'Öffentlich',
    slotColorLabel: 'Terminfarbe',
    descriptionOptionalLabel: 'Beschreibung (Optional)',
    addMessage: 'Nachricht hinzufügen',
  },
};
