/**
 * Unit-configurable defaults for NICU workflows
 * All values can be overridden by individual units
 * Based on BAPM and NICE guidelines
 */

import type { LineAlertThreshold, TubeAlertThreshold } from '../types/alerts.types';

// ============================================================================
// FEEDING DEFAULTS
// ============================================================================

export const FEEDING_DEFAULTS = {
  // Standard volume calculation
  standardVolumeMlPerKgPerDay: 150, // typical range 150-180

  // Weigh days
  weighDays: ['Wednesday', 'Saturday'] as const,

  // Auto-recalculate feeds on weigh days
  autoRecalculateOnWeigh: true,

  // NG tube until
  ngOnlyUntilWeeks: 34, // corrected gestational age

  // Oral trials begin at
  oralTrialStartWeeks: 34, // corrected gestational age

  // Feed tolerance thresholds
  aspirateThresholds: {
    normal: { max: 2, unit: 'ml' }, // ≤2ml considered normal
    concerning: { min: 3, max: 5, unit: 'ml' }, // 3-5ml requires monitoring
    significant: { min: 6, unit: 'ml' }, // ≥6ml may require feed hold
  },

  // pH thresholds for feeds
  phSafeRange: { min: 1, max: 5.5 },
  phWarning: 5.5, // >5.5 do not feed, recheck
  phCritical: 6, // >6 urgent medical review
};

// ============================================================================
// NG TUBE REMOVAL CRITERIA
// ============================================================================

export const NG_REMOVAL_CRITERIA = {
  // Oral percentage threshold
  oralPercentageThreshold: 95, // ≥95% oral per feed

  // Consecutive duration
  consecutiveHours: 24, // every feed for 24 hours

  // No top-ups allowed
  allowNGTopUps: false,

  // Must maintain for this many feeds
  minimumConsecutiveFeeds: 8, // typically 8 feeds over 24hrs at 3-hourly

  // Auto-flag when ready
  autoFlagWhenReady: true,
};

// ============================================================================
// DISCHARGE CRITERIA (3 GATES)
// ============================================================================

export const DISCHARGE_CRITERIA = {
  // Gate 1: Weight
  weightGate: {
    enabled: true,
    minimumWeightGrams: 1800,
    requiredWeightGainGPerKgPerDay: 15, // at least 15g/kg/day
    consecutiveDaysGoodGain: 3,
  },

  // Gate 2: Respiratory Stability
  respiratoryGate: {
    enabled: true,
    noRespiratorySupport: true,
    allowedSupport: [], // empty array = no support
    episodeFreeDays: 5, // no A/B/D for 5 days
    noRespiratoryMeds: true,
    excludedMeds: ['caffeine', 'diuretics', 'bronchodilators'],
  },

  // Gate 3: Feeding Established
  feedingGate: {
    enabled: true,
    fullOralFeeds: true,
    oralPercentageTarget: 100,
    consecutiveDaysFullOral: 2,
    ngTubeMustBeRemoved: true,
    maxFeedDurationMinutes: 30,
    acceptableFeedingMethods: ['breast', 'bottle', 'mixed'],
  },

  // Additional criteria
  temperatureStability: {
    enabled: true,
    daysInOpenCot: 2,
    temperatureRange: { min: 36.5, max: 37.5 },
  },

  // Parent readiness
  parentReadiness: {
    enabled: true,
    requiredSkills: [
      'Basic baby care',
      'Feeding competence',
      'Medication administration (if applicable)',
      'CPR training',
      'Recognizing illness',
      'Safe sleeping guidance',
    ],
  },

  // Auto-flag when all gates met
  autoFlagWhenReady: true,
};

// ============================================================================
// LINE & TUBE ALERT THRESHOLDS
// ============================================================================

export const LINE_ALERT_THRESHOLDS: LineAlertThreshold[] = [
  {
    lineType: 'peripheral_IV',
    warningThreshold: { value: 48, unit: 'hours' },
    criticalThreshold: { value: 72, unit: 'hours' },
    maintenanceCheckFrequency: { value: 4, unit: 'hours' },
  },
  {
    lineType: 'PICC',
    warningThreshold: { value: 10, unit: 'days' },
    criticalThreshold: { value: 14, unit: 'days' },
    maintenanceCheckFrequency: { value: 24, unit: 'hours' },
  },
  {
    lineType: 'UAC',
    warningThreshold: { value: 5, unit: 'days' },
    criticalThreshold: { value: 7, unit: 'days' },
    maintenanceCheckFrequency: { value: 6, unit: 'hours' },
  },
  {
    lineType: 'UVC',
    warningThreshold: { value: 5, unit: 'days' },
    criticalThreshold: { value: 7, unit: 'days' },
    maintenanceCheckFrequency: { value: 6, unit: 'hours' },
  },
  {
    lineType: 'long_line',
    warningThreshold: { value: 21, unit: 'days' },
    criticalThreshold: { value: 28, unit: 'days' },
    maintenanceCheckFrequency: { value: 24, unit: 'hours' },
  },
  {
    lineType: 'femoral_line',
    warningThreshold: { value: 3, unit: 'days' },
    criticalThreshold: { value: 5, unit: 'days' },
    maintenanceCheckFrequency: { value: 12, unit: 'hours' },
  },
];

export const TUBE_ALERT_THRESHOLDS: TubeAlertThreshold[] = [
  {
    tubeType: 'NG',
    changeThreshold: { value: 3, unit: 'days' },
    positionCheckFrequency: { value: 4, unit: 'hours' },
    phThresholds: {
      safe: { min: 1, max: 5.5 },
      warning: 5.5,
      critical: 6,
    },
  },
  {
    tubeType: 'OG',
    changeThreshold: { value: 3, unit: 'days' },
    positionCheckFrequency: { value: 4, unit: 'hours' },
    phThresholds: {
      safe: { min: 1, max: 5.5 },
      warning: 5.5,
      critical: 6,
    },
  },
];

// ============================================================================
// SCREENING REMINDER SETTINGS
// ============================================================================

export const SCREENING_SETTINGS = {
  // Newborn Blood Spot
  nbbs: {
    dayOfLife: 5, // Day 1 = DOB
    reminderDaysBefore: 1,
    escalateIfOverdueDays: 2,
  },

  // Newborn Blood Spot Day 28 (for preterms)
  nbbsDay28: {
    eligible: { gestationalAge: { max: 32 } }, // <32 weeks
    dayOfLife: 28,
    reminderDaysBefore: 3,
  },

  // Pre-transfusion blood spot
  preTransfusionSpot: {
    alertBeforeTransfusion: true,
    alertWindowHours: 24, // alert 24hrs before first transfusion
  },

  // MRSA/CRO swabs
  infectionSwabs: {
    frequency: 'weekly',
    swabDay: 'Monday',
    swabTypes: ['MRSA', 'CRO'],
  },

  // ROP screening
  rop: {
    eligible: {
      gestationalAge: { max: 32 },
      birthWeight: { max: 1500 },
    },
    startWeeks: 30, // corrected gestational age
    endWeeks: 36,
    frequencyWeeks: 1, // weekly
    reminderDaysBefore: 3,
  },

  // Cranial ultrasound schedule
  cranialUSS: {
    eligible: { gestationalAge: { max: 32 } },
    schedule: [
      { dayOfLife: 1, description: 'Day 1-3 scan' },
      { dayOfLife: 7, description: 'Day 7 scan' },
      { dayOfLife: 28, description: 'Day 28 scan' },
      { correctedAge: 36, description: '36 weeks CGA scan' },
    ],
  },

  // Hearing screening
  hearing: {
    minDayOfLife: 5,
    beforeDischarge: true,
    reminderDaysBefore: 7,
  },
};

// ============================================================================
// EPISODE (A/B/D) THRESHOLDS
// ============================================================================

export const EPISODE_THRESHOLDS = {
  // Definition thresholds
  apnoea: {
    durationSeconds: 20, // >20 seconds
  },

  bradycardia: {
    heartRate: 100, // <100 bpm for term, <80 for preterm
    durationSeconds: 10,
  },

  desaturation: {
    oxygenSaturation: 85, // <85% for >10 seconds
    durationSeconds: 10,
  },

  // Alert thresholds
  alertThresholds: {
    episodesPerShift: 10, // >10 episodes in one shift
    interventionRate: 30, // >30% requiring intervention
    increaseTrend: 50, // >50% increase from previous shift
  },

  // Discharge criteria
  dischargeCriteria: {
    episodeFreeDays: 5, // 5 days without episodes
    maxMinorEpisodes: 2, // max 2 self-resolved episodes per week
  },
};

// ============================================================================
// VITAL SIGNS ALERT RANGES
// ============================================================================

export const VITAL_SIGNS_RANGES = {
  heartRate: {
    preterm: { min: 110, max: 160 },
    term: { min: 100, max: 160 },
  },

  respiratoryRate: {
    preterm: { min: 40, max: 60 },
    term: { min: 30, max: 60 },
  },

  oxygenSaturation: {
    target: { min: 91, max: 95 }, // typical target range
    warning: 88, // <88%
    critical: 85, // <85%
  },

  temperature: {
    axillary: { min: 36.5, max: 37.5 },
    warning: { min: 36, max: 38 },
    critical: { min: 35.5, max: 38.5 },
  },

  bloodPressure: {
    // Mean BP should be > gestational age in weeks
    meanBPRule: 'gestational_age_in_weeks',
  },
};

// ============================================================================
// HANDOVER SETTINGS
// ============================================================================

export const HANDOVER_SETTINGS = {
  // Auto-generation timing
  shiftEndTimes: {
    day: '19:30',
    night: '07:30',
    long_day: '20:00',
  },

  // What to include
  includeInHandover: {
    vitalSignsRange: true,
    feedTotals: true,
    oralPercentage: true,
    aspirates: true,
    episodeCounts: true,
    medicationChanges: true,
    labResults: true,
    clinicalNotesFlagged: true,
    outstandingTasks: true,
    dischargeCriteriaProgress: true,
  },

  // Export formats
  exportFormats: ['pdf', 'text', 'json'],

  // Retain for
  retainDays: 90,
};

// ============================================================================
// UNIT CONFIGURATION INTERFACE
// ============================================================================

export interface UnitConfiguration {
  unitId: string;
  unitName: string;
  trustId: string;
  trustName: string;

  // Override any defaults
  feeding?: Partial<typeof FEEDING_DEFAULTS>;
  ngRemoval?: Partial<typeof NG_REMOVAL_CRITERIA>;
  discharge?: Partial<typeof DISCHARGE_CRITERIA>;
  lineThresholds?: LineAlertThreshold[];
  tubeThresholds?: TubeAlertThreshold[];
  screening?: Partial<typeof SCREENING_SETTINGS>;
  episodes?: Partial<typeof EPISODE_THRESHOLDS>;
  vitalSigns?: Partial<typeof VITAL_SIGNS_RANGES>;
  handover?: Partial<typeof HANDOVER_SETTINGS>;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================================================
// DEFAULT UNIT CONFIGURATION
// ============================================================================

export const DEFAULT_UNIT_CONFIG: UnitConfiguration = {
  unitId: 'default',
  unitName: 'Default NICU',
  trustId: 'default',
  trustName: 'Default Trust',
  feeding: FEEDING_DEFAULTS,
  ngRemoval: NG_REMOVAL_CRITERIA,
  discharge: DISCHARGE_CRITERIA,
  lineThresholds: LINE_ALERT_THRESHOLDS,
  tubeThresholds: TUBE_ALERT_THRESHOLDS,
  screening: SCREENING_SETTINGS,
  episodes: EPISODE_THRESHOLDS,
  vitalSigns: VITAL_SIGNS_RANGES,
  handover: HANDOVER_SETTINGS,
  createdAt: new Date(),
  updatedAt: new Date(),
  updatedBy: 'system',
};
