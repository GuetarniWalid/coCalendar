import { SupportedLocale } from '../locale';

export interface Translations {
  // Day View
  addTask: string;
  noSlotsForDay: string;
  tapToAddSlot: string;
  emptyDayTitle: string; // Title for empty day card
  emptyDayText: string; // Subtitle/text for empty day card

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
  timeToday: string; // For slots with date but no specific time
  timeToDo: string; // For slots without any date

  // Progress time remaining
  remainingPrefix: string; // "Encore" / "Still" / etc.
  minutesSingular: string; // "minute"
  minutesPlural: string; // "minutes" / "min"
  secondsSingular: string; // "seconde"
  secondsPlural: string; // "secondes"

  // Remaining time card
  remainingTimeText: string; // "Take a break"

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

  // Onboarding
  onboardingWelcomeTitle: string;
  onboardingWelcomeSubtitle: string;
  onboardingWelcomeDescription: string;
  onboardingFeaturesTitle: string;
  onboardingFeaturesSubtitle: string;
  onboardingFeature1Title: string;
  onboardingFeature1Description: string;
  onboardingFeature2Title: string;
  onboardingFeature2Description: string;
  onboardingGetStartedTitle: string;
  onboardingGetStartedSubtitle: string;
  onboardingNext: string;
  onboardingSkip: string;
  onboardingGetStarted: string;
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
    timeToday: 'Today',
    timeToDo: 'To do',

    // Progress time remaining
    remainingPrefix: 'Still',
    minutesSingular: 'minute',
    minutesPlural: 'min',
    secondsSingular: 'second',
    secondsPlural: 'seconds',

    // Remaining time card
    remainingTimeText: 'Take a break',

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

    // Onboarding
    onboardingWelcomeTitle: 'Welcome to coCalendar',
    onboardingWelcomeSubtitle: 'Beautiful design meets effortless planning',
    onboardingWelcomeDescription:
      'Experience a calendar that prioritizes exceptional design and intuitive scheduling. Manage your time with elegance and precision.',
    onboardingFeaturesTitle: 'Smart Sharing & Privacy',
    onboardingFeaturesSubtitle: 'Control exactly what you share',
    onboardingFeature1Title: 'Share Selectively',
    onboardingFeature1Description:
      'Choose specific time slots to share with friends, family, or colleagues. Everything stays private by default.',
    onboardingFeature2Title: 'Your Privacy First',
    onboardingFeature2Description:
      'Maintain complete control. Share only what you want, when you want. Perfect coordination without compromising privacy.',
    onboardingGetStartedTitle: 'Ready to Start?',
    onboardingGetStartedSubtitle:
      'Create your free account and experience beautiful calendar management',
    onboardingNext: 'Next',
    onboardingSkip: 'Skip',
    onboardingGetStarted: 'Get Started',
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
    today: "Aujourd'hui",
    calendar: 'Calendrier',
    profile: 'Profil',

    // Time
    startTime: 'Heure de début',
    endTime: 'Heure de fin',
    timeToday: "Aujourd'hui",
    timeToDo: 'À faire',

    // Progress time remaining
    remainingPrefix: 'Encore',
    minutesSingular: 'minute',
    minutesPlural: 'min',
    secondsSingular: 'seconde',
    secondsPlural: 'secondes',

    // Remaining time card
    remainingTimeText: 'Prenez une pause',

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

    // Onboarding
    onboardingWelcomeTitle: 'Bienvenue sur coCalendar',
    onboardingWelcomeSubtitle: 'Un design magnifique pour une planification sans effort',
    onboardingWelcomeDescription:
      'Découvrez un calendrier qui privilégie un design exceptionnel et une planification intuitive. Gérez votre temps avec élégance et précision.',
    onboardingFeaturesTitle: 'Partage intelligent & Confidentialité',
    onboardingFeaturesSubtitle: 'Contrôlez exactement ce que vous partagez',
    onboardingFeature1Title: 'Partage sélectif',
    onboardingFeature1Description:
      'Choisissez des créneaux spécifiques à partager avec vos amis, votre famille ou vos collègues. Tout reste privé par défaut.',
    onboardingFeature2Title: 'Votre confidentialité d\'abord',
    onboardingFeature2Description:
      'Gardez le contrôle total. Partagez uniquement ce que vous voulez, quand vous le voulez. Coordination parfaite sans compromettre votre vie privée.',
    onboardingGetStartedTitle: 'Prêt à commencer ?',
    onboardingGetStartedSubtitle:
      'Créez votre compte gratuit et découvrez une gestion de calendrier magnifique',
    onboardingNext: 'Suivant',
    onboardingSkip: 'Passer',
    onboardingGetStarted: 'Commencer',
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
    timeToday: 'Hoy',
    timeToDo: 'Por hacer',

    // Progress time remaining
    remainingPrefix: 'Quedan',
    minutesSingular: 'minuto',
    minutesPlural: 'min',
    secondsSingular: 'segundo',
    secondsPlural: 'segundos',

    // Remaining time card
    remainingTimeText: 'Tómese un descanso',

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

    // Onboarding
    onboardingWelcomeTitle: 'Bienvenido a coCalendar',
    onboardingWelcomeSubtitle: 'Diseño hermoso y planificación sin esfuerzo',
    onboardingWelcomeDescription:
      'Experimenta un calendario que prioriza un diseño excepcional y una planificación intuitiva. Gestiona tu tiempo con elegancia y precisión.',
    onboardingFeaturesTitle: 'Compartir inteligente y privacidad',
    onboardingFeaturesSubtitle: 'Controla exactamente lo que compartes',
    onboardingFeature1Title: 'Compartir selectivamente',
    onboardingFeature1Description:
      'Elige espacios de tiempo específicos para compartir con amigos, familia o colegas. Todo permanece privado por defecto.',
    onboardingFeature2Title: 'Tu privacidad primero',
    onboardingFeature2Description:
      'Mantén el control completo. Comparte solo lo que quieras, cuando quieras. Coordinación perfecta sin comprometer la privacidad.',
    onboardingGetStartedTitle: '¿Listo para comenzar?',
    onboardingGetStartedSubtitle:
      'Crea tu cuenta gratuita y experimenta una hermosa gestión de calendario',
    onboardingNext: 'Siguiente',
    onboardingSkip: 'Omitir',
    onboardingGetStarted: 'Comenzar',
  },
  de: {
    // Day View
    addTask: 'Eine Sache hinzufügen',
    noSlotsForDay: 'Keine Termine für diesen Tag',
    tapToAddSlot:
      'Tippen Sie auf die + Schaltfläche, um einen neuen Termin hinzuzufügen',
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
    timeToday: 'Heute',
    timeToDo: 'Zu erledigen',

    // Progress time remaining
    remainingPrefix: 'Noch',
    minutesSingular: 'Minute',
    minutesPlural: 'Min',
    secondsSingular: 'Sekunde',
    secondsPlural: 'Sekunden',

    // Remaining time card
    remainingTimeText: 'Machen Sie eine Pause',

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

    // Onboarding
    onboardingWelcomeTitle: 'Willkommen bei coCalendar',
    onboardingWelcomeSubtitle: 'Schönes Design trifft mühelose Planung',
    onboardingWelcomeDescription:
      'Erleben Sie einen Kalender, der außergewöhnliches Design und intuitive Planung priorisiert. Verwalten Sie Ihre Zeit mit Eleganz und Präzision.',
    onboardingFeaturesTitle: 'Intelligentes Teilen & Datenschutz',
    onboardingFeaturesSubtitle: 'Kontrollieren Sie genau, was Sie teilen',
    onboardingFeature1Title: 'Selektiv teilen',
    onboardingFeature1Description:
      'Wählen Sie bestimmte Zeitfenster zum Teilen mit Freunden, Familie oder Kollegen. Alles bleibt standardmäßig privat.',
    onboardingFeature2Title: 'Ihre Privatsphäre zuerst',
    onboardingFeature2Description:
      'Behalten Sie die volle Kontrolle. Teilen Sie nur, was Sie wollen, wann Sie wollen. Perfekte Koordination ohne Kompromisse bei der Privatsphäre.',
    onboardingGetStartedTitle: 'Bereit anzufangen?',
    onboardingGetStartedSubtitle:
      'Erstellen Sie Ihr kostenloses Konto und erleben Sie eine schöne Kalenderverwaltung',
    onboardingNext: 'Weiter',
    onboardingSkip: 'Überspringen',
    onboardingGetStarted: 'Loslegen',
  },
};
