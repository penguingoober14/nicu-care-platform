import { Timestamp } from 'firebase/firestore';
import type { BabyRecord } from './core.types';

// ============================================================================
// FEED COMPLIANCE TRACKING
// ============================================================================

/**
 * 24-hour rolling window feed compliance tracking
 * Used for NG removal readiness and discharge criteria
 */
export interface FeedingCompliance extends BabyRecord {
  calculatedAt: Timestamp;

  // Rolling window period
  windowStart: Timestamp;
  windowEnd: Timestamp;
  windowHours: number; // typically 24

  // Feed counts
  totalFeedsScheduled: number;
  totalFeedsCompleted: number;
  completionRate: number; // percentage

  // Oral feeding progress
  oralFeeds: number;
  ngFeeds: number;
  oralPercentage: number; // percentage of total volume taken orally

  // Volume compliance
  volumeCompliance: {
    totalPrescribed: number; // ml
    totalActual: number; // ml
    complianceRate: number; // percentage
  };

  // Missed feeds
  missedFeeds: {
    scheduledTime: Timestamp;
    reason: string;
    clinicallySignificant: boolean;
  }[];

  // NG removal readiness
  ngRemovalReadiness?: {
    oralThresholdMet: boolean; // ≥95%
    consecutiveHoursMet: boolean; // 24 hours
    zeroTopUpsMet: boolean;
    ready: boolean;
    feedsUntilReady?: number;
    currentConsecutiveStreak: number; // hours
  };
}

/**
 * Per-feed oral intake tracking
 * Extension data for FeedingRecord
 */
export interface FeedOralTracking {
  feedId: string;
  babyId: string;
  feedTime: Timestamp;

  // Prescribed vs actual
  prescribedVolume: number; // ml
  oralVolume: number; // ml
  ngVolume: number; // ml
  totalVolume: number; // ml

  // Oral percentage for this feed
  oralPercentage: number;

  // Feeding performance
  feedingDuration?: number; // minutes
  cueBasedFeeding: boolean;
  tookBreaks: boolean;
  stressSignsDuringFeed: string[];

  // Tolerance
  toleranceRating: 'excellent' | 'good' | 'moderate' | 'poor';
  aspirateVolume?: number; // ml
  aspirateColor?: 'clear' | 'milky' | 'yellow' | 'green' | 'bilious' | 'bloody';
  vomited: boolean;
  vomitVolume?: number; // ml

  // Notes
  recordedBy: string;
  notes?: string;
}

/**
 * NG tube removal readiness tracker
 * Monitors consecutive feeds above threshold
 */
export interface NGRemovalTracker extends BabyRecord {
  correctedGestationalAge: {
    weeks: number;
    days: number;
  };

  // Current status
  status: 'not_ready' | 'approaching' | 'ready' | 'tube_removed';

  // Threshold criteria
  criteria: {
    oralPercentageThreshold: number; // typically 95%
    consecutiveHoursRequired: number; // typically 24
    allowTopUps: boolean; // typically false
  };

  // Current streak
  currentStreak: {
    startTime: Timestamp;
    consecutiveHours: number;
    feedsAboveThreshold: number;
    averageOralPercentage: number;
  };

  // History of streaks
  previousStreaks: {
    startTime: Timestamp;
    endTime: Timestamp;
    durationHours: number;
    reasonEnded: string;
  }[];

  // Readiness assessment
  assessmentDate: Timestamp;
  feedsUntilReady: number;
  estimatedReadyDate?: Timestamp;

  // MDT decision
  mdtReview?: {
    reviewedBy: string;
    reviewDate: Timestamp;
    decision: 'proceed_with_removal' | 'continue_monitoring' | 'not_appropriate';
    notes: string;
  };

  // Tube removal record
  removalRecord?: {
    removedAt: Timestamp;
    removedBy: string;
    postRemovalMonitoring: boolean;
  };
}

/**
 * Feed volume auto-calculation
 * Based on current weight and unit defaults
 */
export interface FeedVolumeCalculation {
  babyId: string;
  calculatedAt: Timestamp;

  // Weight basis
  currentWeight: number; // grams
  weighDate: Timestamp;

  // Calculation
  targetMlPerKgPerDay: number; // typically 150-180
  totalDailyVolume: number; // ml
  feedFrequency: number; // hours between feeds
  volumePerFeed: number; // ml

  // Adjustments
  adjustmentReason?: string;
  adjustedBy?: string;

  // Next weigh day
  nextWeighDate?: Timestamp;
  autoRecalculateOnWeigh: boolean;
}
