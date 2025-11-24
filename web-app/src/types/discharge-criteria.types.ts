import { Timestamp } from 'firebase/firestore';
import type { BabyRecord } from './core.types';

// ============================================================================
// DISCHARGE CRITERIA & READINESS CALCULATION
// ============================================================================

/**
 * Three-gate discharge criteria
 * Gate 1: Weight ≥1.8kg
 * Gate 2: Respiratory stability (no support, no heavy meds)
 * Gate 3: Feeding established (full oral feeds)
 */
export interface DischargeCriteria extends BabyRecord {
  assessmentDate: Timestamp;
  assessedBy: string;

  // Overall readiness
  overallStatus: 'not_ready' | 'approaching' | 'ready' | 'discharge_planned';
  readinessScore: number; // 0-100%

  // Gate 1: Weight
  weightCriterion: {
    required: boolean;
    met: boolean;
    currentWeight: number; // grams
    targetWeight: number; // typically 1800
    lastWeighed: Timestamp;
    gainTrend: 'poor' | 'adequate' | 'good';
    daysUntilTarget?: number;
  };

  // Gate 2: Respiratory Stability
  respiratoryCriterion: {
    required: boolean;
    met: boolean;

    // No respiratory support
    noRespiratorySupport: boolean;
    currentSupport?: string; // e.g., "CPAP 6cm", "Room air"
    daysOffSupport?: number;

    // No apnoea/bradycardia
    episodeFreeForDays: number;
    requiredEpisodeFreeDays: number; // typically 5-7
    episodeRate: number; // episodes per day

    // Medications
    noRespiratoryMeds: boolean;
    currentRespiratoryMeds?: string[];
  };

  // Gate 3: Feeding Established
  feedingCriterion: {
    required: boolean;
    met: boolean;

    // Full oral feeds
    fullOralFeeds: boolean;
    oralPercentage: number; // current 24hr average
    targetOralPercentage: number; // typically 100%
    oralFeedsConsecutiveDays: number;
    requiredConsecutiveDays: number; // typically 2-3

    // NG tube status
    ngTubeRemoved: boolean;
    ngRemovalDate?: Timestamp;
    daysWithoutNGTube?: number;

    // Feeding competency
    feedingDuration: {
      average: number; // minutes
      acceptable: boolean; // typically <30 min
    };

    // Breast/bottle
    establishedMethod: 'breast' | 'bottle' | 'mixed' | 'not_established';
    maternalIntention?: 'breast' | 'formula' | 'mixed';
  };

  // Additional criteria (unit-specific)
  additionalCriteria?: {
    [key: string]: {
      required: boolean;
      met: boolean;
      description: string;
      notes?: string;
    };
  };

  // Temperature stability
  temperatureStability?: {
    required: boolean;
    met: boolean;
    daysInOpenCot: number;
    requiredDays: number; // typically 2-3
    temperatureRange: { min: number; max: number };
  };

  // Parent readiness
  parentReadiness?: {
    required: boolean;
    met: boolean;
    skillsCompleted: string[];
    skillsRemaining: string[];
    confidenceLevel: 'low' | 'moderate' | 'high';
  };

  // Estimated discharge date
  estimatedDischargeDate?: Timestamp;
  dischargeDateConfidence: 'low' | 'medium' | 'high';

  // Blockers
  currentBlockers: string[];
  actionsPending: {
    action: string;
    assignedTo?: string;
    dueBy?: Timestamp;
    completed: boolean;
  }[];

  // MDT review
  mdtReview?: {
    reviewedBy: string;
    reviewDate: Timestamp;
    decision: 'proceed_to_discharge' | 'continue_monitoring' | 'additional_criteria_needed';
    targetDischargeDate?: Timestamp;
    notes: string;
  };
}

/**
 * Discharge readiness dashboard widget
 */
export interface DischargeReadinessSummary {
  babyId: string;
  lastUpdated: Timestamp;

  // Progress
  gatesMet: number; // 0-3
  totalGates: number; // typically 3
  progressPercentage: number; // 0-100%

  // Status
  status: 'not_ready' | 'approaching' | 'ready';
  statusColor: 'red' | 'amber' | 'green';

  // Next steps
  nextMilestone: {
    criterion: string;
    description: string;
    estimatedDays?: number;
  };

  // Quick view
  gates: {
    weight: { met: boolean; detail: string };
    respiratory: { met: boolean; detail: string };
    feeding: { met: boolean; detail: string };
  };

  // Discharge date
  estimatedDischargeDate?: Timestamp;
  dischargeConfidence: 'low' | 'medium' | 'high';
}

/**
 * Discharge planning progress tracker
 */
export interface DischargePlanningProgress extends BabyRecord {
  planCreatedDate: Timestamp;
  targetDischargeDate?: Timestamp;

  // Criteria tracking over time
  criteriaHistory: {
    date: Timestamp;
    weight: boolean;
    respiratory: boolean;
    feeding: boolean;
    overallReady: boolean;
  }[];

  // Checklist completion
  checklistCompletion: {
    totalItems: number;
    completedItems: number;
    completionPercentage: number;
    criticalItemsRemaining: string[];
  };

  // Appointments booked
  followUpAppointments: {
    service: string;
    booked: boolean;
    appointmentDate?: Timestamp;
  }[];

  // Parent education
  parentEducation: {
    sessionCompleted: boolean;
    sessionDate?: Timestamp;
    skillsAssessed: string[];
    additionalSupportNeeded: string[];
  };

  // Equipment
  equipmentOrdered: {
    item: string;
    ordered: boolean;
    received: boolean;
  }[];

  // Ready for discharge
  readyForDischarge: boolean;
  dischargeCleared: boolean;
  dischargeDate?: Timestamp;
}
