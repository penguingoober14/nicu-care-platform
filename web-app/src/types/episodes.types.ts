import { Timestamp } from 'firebase/firestore';
import type { BabyRecord } from './core.types';

// ============================================================================
// EPISODE TRACKING (Apnoea, Bradycardia, Desaturation)
// ============================================================================

export type EpisodeType = 'apnoea' | 'bradycardia' | 'desaturation';
export type EpisodeSeverity = 'mild' | 'moderate' | 'severe';
export type InterventionType =
  | 'none_self_resolved'
  | 'gentle_stimulation'
  | 'vigorous_stimulation'
  | 'suction'
  | 'repositioning'
  | 'increased_oxygen'
  | 'bag_mask_ventilation'
  | 'cpap_adjustment'
  | 'other';

/**
 * Individual episode record
 */
export interface Episode {
  id: string;
  timestamp: Timestamp;
  type: EpisodeType;
  severity: EpisodeSeverity;

  // Episode details
  duration?: number; // seconds
  lowestValue?: number; // lowest HR or SpO2

  // Intervention
  selfResolved: boolean;
  interventionRequired: boolean;
  interventions: InterventionType[];
  interventionNotes?: string;

  // Context
  activityAtTime?: 'feeding' | 'sleeping' | 'handling' | 'procedure' | 'other';
  respiratorySupport?: string; // e.g., "CPAP 6 @ 25%"

  // Staff
  recordedBy: string;
  witnessedBy?: string;
}

/**
 * Episode log per shift
 * Aggregates all episodes for handover
 */
export interface EpisodeLog extends BabyRecord {
  shift: 'day' | 'night' | 'long_day';
  shiftStart: Timestamp;
  shiftEnd: Timestamp;

  // Episode collections
  apnoeas: Episode[];
  bradycardias: Episode[];
  desaturations: Episode[];

  // Summary counts
  summary: {
    totalEpisodes: number;
    apnoeaCount: number;
    bradycardiaCount: number;
    desaturationCount: number;

    // Intervention breakdown
    selfResolvedCount: number;
    stimulationCount: number;
    oxygenIncreaseCount: number;
    baggingCount: number;

    // Rate calculations
    episodesPerHour: number;
    interventionRate: number; // percentage requiring intervention
  };

  // Trend analysis
  trend?: {
    comparedToLastShift: 'improving' | 'stable' | 'worsening';
    previousShiftCount: number;
    changePercentage: number;
  };

  // Clinical significance
  clinicallySignificant: boolean;
  escalatedToMedicalTeam: boolean;
  escalationNotes?: string;

  // Handover flag
  flaggedForHandover: boolean;
  handoverNotes?: string;
}

/**
 * Episode counter widget state
 * Real-time display for quick logging
 */
export interface EpisodeCounterState {
  babyId: string;
  currentShift: 'day' | 'night' | 'long_day';

  // Live counts
  apnoeaCount: number;
  bradycardiaCount: number;
  desaturationCount: number;

  // Last episode times
  lastApnoea?: Timestamp;
  lastBradycardia?: Timestamp;
  lastDesaturation?: Timestamp;

  // Quick stats
  recentEpisodes: Episode[]; // last 5 episodes
  selfResolvedPercentage: number;

  // Alerts
  rateIncreasing: boolean;
  requiresReview: boolean;
}

/**
 * Episode trend analysis
 * Multi-day tracking for discharge planning
 */
export interface EpisodeTrend extends BabyRecord {
  analysisDate: Timestamp;
  daysCovered: number;

  // Daily episode counts
  dailyCounts: {
    date: Timestamp;
    totalEpisodes: number;
    apnoeas: number;
    bradycardias: number;
    desaturations: number;
    interventionRate: number;
  }[];

  // Trend direction
  trendDirection: 'improving' | 'stable' | 'worsening';

  // Discharge readiness
  episodeFreeForDays?: number;
  meetsDischargeCriteria: boolean;
  dischargeCriteriaThreshold: number; // typically 5-7 days episode-free
}
