import { Timestamp } from 'firebase/firestore';
import type { BabyRecord } from './core.types';

// ============================================================================
// SCREENING REMINDER SYSTEM
// ============================================================================

export type ScreeningType =
  | 'newborn_blood_spot' // NBBS
  | 'hearing_screening'
  | 'rop_screening' // Retinopathy of Prematurity
  | 'cranial_ultrasound'
  | 'echocardiogram'
  | 'pre_transfusion_blood_spot'
  | 'mrsa_swab'
  | 'cro_swab'
  | 'discharge_hearing_screen'
  | 'discharge_physical_exam';

export type ScreeningStatus = 'not_due' | 'due' | 'overdue' | 'scheduled' | 'completed' | 'not_indicated';

/**
 * Screening reminder with rule-based scheduling
 */
export interface ScreeningReminder extends BabyRecord {
  screeningType: ScreeningType;
  status: ScreeningStatus;

  // Eligibility criteria
  eligibilityCriteria: {
    gestationalAgeAtBirth?: { min?: number; max?: number }; // weeks
    birthWeight?: { min?: number; max?: number }; // grams
    correctedAge?: { min?: number; max?: number }; // weeks
    postnatalAge?: { min?: number; max?: number }; // days
    otherCriteria?: string[];
  };

  // Is this baby eligible?
  isEligible: boolean;
  eligibilityReason?: string;

  // Scheduling
  dueDate?: Timestamp;
  dueDateCalculation?: string; // explanation of how due date was calculated
  scheduledDate?: Timestamp;
  scheduledLocation?: string;

  // Completion
  completedDate?: Timestamp;
  completedBy?: string;
  result?: string;
  resultDate?: Timestamp;
  resultLocation?: string; // where results are stored

  // Reminders sent
  reminders: {
    sentAt: Timestamp;
    sentTo: string; // user ID
    method: 'dashboard_alert' | 'email' | 'handover_note';
  }[];

  // Notes
  notes?: string;
  cancellationReason?: string; // if not_indicated after initial eligibility
}

/**
 * Screening schedule configuration
 * Defines rules for each screening type
 */
export interface ScreeningScheduleRule {
  screeningType: ScreeningType;
  displayName: string;
  description: string;

  // Eligibility rules
  eligibilityRules: {
    gestationalAgeAtBirth?: { min?: number; max?: number };
    birthWeight?: { min?: number; max?: number };
    correctedAge?: { min?: number; max?: number };
    postnatalAge?: { min?: number; max?: number };
    customRules?: string[];
  };

  // Timing rules
  timingRules: {
    // When to schedule
    scheduleAt: {
      type: 'postnatal_day' | 'corrected_age_weeks' | 'before_discharge' | 'specific_date' | 'on_event';
      value?: number;
      event?: string; // e.g., "before_transfusion"
    };

    // Frequency (for repeat screenings)
    frequency?: {
      type: 'once' | 'daily' | 'weekly' | 'monthly';
      repeatUntil?: { correctedAge?: number; postnatalAge?: number };
    };
  };

  // Reminder settings
  reminderSettings: {
    firstReminderDaysBefore: number;
    reminderFrequency: 'daily' | 'weekly';
    escalateIfOverdueDays: number;
  };

  // Priority
  priority: 'routine' | 'important' | 'urgent';
  isMandatory: boolean;
}

/**
 * Screening dashboard summary
 */
export interface ScreeningSummary extends BabyRecord {
  lastUpdated: Timestamp;

  // Upcoming screenings (next 7 days)
  upcomingScreenings: ScreeningReminder[];

  // Overdue screenings
  overdueScreenings: ScreeningReminder[];

  // Completed screenings
  completedScreenings: ScreeningReminder[];

  // Not indicated screenings
  notIndicatedScreenings: ScreeningReminder[];

  // Counts
  totalDue: number;
  totalOverdue: number;
  totalCompleted: number;

  // Alerts
  criticalOverdue: ScreeningReminder[]; // overdue by >7 days
  requiresAttention: boolean;
}

/**
 * Standard NICU screening schedules
 * Pre-configured rules for common screenings
 */
export const STANDARD_SCREENING_RULES: Record<ScreeningType, ScreeningScheduleRule> = {
  newborn_blood_spot: {
    screeningType: 'newborn_blood_spot',
    displayName: 'Newborn Blood Spot (NBBS)',
    description: 'Day 5 blood spot screening (Day 1 = DOB)',
    eligibilityRules: {},
    timingRules: {
      scheduleAt: { type: 'postnatal_day', value: 5 },
    },
    reminderSettings: {
      firstReminderDaysBefore: 1,
      reminderFrequency: 'daily',
      escalateIfOverdueDays: 2,
    },
    priority: 'urgent',
    isMandatory: true,
  },

  hearing_screening: {
    screeningType: 'hearing_screening',
    displayName: 'Hearing Screening (AABR)',
    description: 'Automated Auditory Brainstem Response',
    eligibilityRules: {},
    timingRules: {
      scheduleAt: { type: 'before_discharge' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 7,
      reminderFrequency: 'weekly',
      escalateIfOverdueDays: 0,
    },
    priority: 'important',
    isMandatory: true,
  },

  rop_screening: {
    screeningType: 'rop_screening',
    displayName: 'ROP Screening',
    description: 'Retinopathy of Prematurity screening',
    eligibilityRules: {
      gestationalAgeAtBirth: { max: 32 },
      birthWeight: { max: 1500 },
    },
    timingRules: {
      scheduleAt: { type: 'corrected_age_weeks', value: 30 },
      frequency: { type: 'weekly', repeatUntil: { correctedAge: 36 } },
    },
    reminderSettings: {
      firstReminderDaysBefore: 3,
      reminderFrequency: 'daily',
      escalateIfOverdueDays: 1,
    },
    priority: 'urgent',
    isMandatory: true,
  },

  cranial_ultrasound: {
    screeningType: 'cranial_ultrasound',
    displayName: 'Cranial Ultrasound',
    description: 'Head ultrasound for preterm infants',
    eligibilityRules: {
      gestationalAgeAtBirth: { max: 32 },
    },
    timingRules: {
      scheduleAt: { type: 'postnatal_day', value: 1 },
      frequency: { type: 'once' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 0,
      reminderFrequency: 'daily',
      escalateIfOverdueDays: 1,
    },
    priority: 'important',
    isMandatory: true,
  },

  echocardiogram: {
    screeningType: 'echocardiogram',
    displayName: 'Echocardiogram',
    description: 'Cardiac ultrasound',
    eligibilityRules: {
      customRules: ['heart_murmur', 'suspected_pda', 'congenital_heart_disease_risk'],
    },
    timingRules: {
      scheduleAt: { type: 'on_event', event: 'clinical_indication' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 1,
      reminderFrequency: 'daily',
      escalateIfOverdueDays: 3,
    },
    priority: 'important',
    isMandatory: false,
  },

  pre_transfusion_blood_spot: {
    screeningType: 'pre_transfusion_blood_spot',
    displayName: 'Pre-Transfusion Blood Spot',
    description: 'Blood spot before first transfusion',
    eligibilityRules: {},
    timingRules: {
      scheduleAt: { type: 'on_event', event: 'before_transfusion' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 0,
      reminderFrequency: 'daily',
      escalateIfOverdueDays: 0,
    },
    priority: 'urgent',
    isMandatory: true,
  },

  mrsa_swab: {
    screeningType: 'mrsa_swab',
    displayName: 'MRSA Swab',
    description: 'Weekly MRSA screening',
    eligibilityRules: {},
    timingRules: {
      scheduleAt: { type: 'postnatal_day', value: 0 },
      frequency: { type: 'weekly' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 1,
      reminderFrequency: 'weekly',
      escalateIfOverdueDays: 2,
    },
    priority: 'routine',
    isMandatory: true,
  },

  cro_swab: {
    screeningType: 'cro_swab',
    displayName: 'CRO Swab',
    description: 'Carbapenem-resistant organism screening',
    eligibilityRules: {},
    timingRules: {
      scheduleAt: { type: 'postnatal_day', value: 0 },
      frequency: { type: 'weekly' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 1,
      reminderFrequency: 'weekly',
      escalateIfOverdueDays: 2,
    },
    priority: 'routine',
    isMandatory: true,
  },

  discharge_hearing_screen: {
    screeningType: 'discharge_hearing_screen',
    displayName: 'Discharge Hearing Screen',
    description: 'Final hearing screen before discharge',
    eligibilityRules: {},
    timingRules: {
      scheduleAt: { type: 'before_discharge' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 7,
      reminderFrequency: 'weekly',
      escalateIfOverdueDays: 0,
    },
    priority: 'important',
    isMandatory: true,
  },

  discharge_physical_exam: {
    screeningType: 'discharge_physical_exam',
    displayName: 'Discharge Physical Exam',
    description: 'Final examination before discharge',
    eligibilityRules: {},
    timingRules: {
      scheduleAt: { type: 'before_discharge' },
    },
    reminderSettings: {
      firstReminderDaysBefore: 3,
      reminderFrequency: 'daily',
      escalateIfOverdueDays: 0,
    },
    priority: 'urgent',
    isMandatory: true,
  },
};
