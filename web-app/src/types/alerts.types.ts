import { Timestamp } from 'firebase/firestore';
import type { BabyRecord } from './core.types';

// ============================================================================
// ALERT SYSTEM
// ============================================================================

export type AlertType =
  | 'line_duration'
  | 'line_maintenance'
  | 'tube_position_check'
  | 'tube_change_due'
  | 'tube_ph_high'
  | 'screening_due'
  | 'screening_overdue'
  | 'medication_review'
  | 'discharge_task_incomplete'
  | 'vital_signs_abnormal'
  | 'episode_rate_high'
  | 'feed_missed'
  | 'weight_check_due'
  | 'clinical_review_due';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'dismissed' | 'resolved';

/**
 * Base alert interface
 */
export interface Alert {
  id: string;
  babyId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;

  // Alert content
  title: string;
  message: string;
  details?: string;

  // Source
  sourceType: 'line' | 'tube' | 'screening' | 'medication' | 'vital_signs' | 'episode' | 'feed' | 'discharge' | 'other';
  sourceId?: string; // ID of the related record

  // Timing
  createdAt: Timestamp;
  dueAt?: Timestamp;
  acknowledgedAt?: Timestamp;
  dismissedAt?: Timestamp;
  resolvedAt?: Timestamp;

  // Actions
  acknowledgedBy?: string;
  dismissedBy?: string;
  dismissalReason?: string;
  resolvedBy?: string;

  // Snooze
  snoozedUntil?: Timestamp;
  snoozedBy?: string;

  // Action required
  actionRequired: boolean;
  actionType?: 'check_line' | 'change_tube' | 'schedule_screening' | 'review_medication' | 'complete_task';
  actionUrl?: string; // Deep link to relevant component
}

/**
 * Line/tube duration alert configuration
 */
export interface LineAlertThreshold {
  lineType: 'peripheral_IV' | 'PICC' | 'UAC' | 'UVC' | 'long_line' | 'femoral_line';

  // Warning thresholds
  warningThreshold: {
    value: number;
    unit: 'hours' | 'days';
  };

  // Critical thresholds
  criticalThreshold: {
    value: number;
    unit: 'hours' | 'days';
  };

  // Maintenance check frequency
  maintenanceCheckFrequency: {
    value: number;
    unit: 'hours' | 'days';
  };
}

export interface TubeAlertThreshold {
  tubeType: 'NG' | 'OG';

  // Change threshold
  changeThreshold: {
    value: number;
    unit: 'hours' | 'days';
  };

  // Position check frequency
  positionCheckFrequency: {
    value: number;
    unit: 'hours';
  };

  // pH thresholds
  phThresholds: {
    safe: { min: number; max: number }; // typically 1-5.5
    warning: number; // typically >5.5
    critical: number; // typically >6
  };
}

/**
 * Active line/tube with alert status
 */
export interface LineWithAlerts {
  lineId: string;
  babyId: string;
  lineType: string;
  insertionSite: string;
  insertionDate: Timestamp;

  // Current status
  isActive: boolean;
  daysInSitu: number;
  hoursInSitu: number;

  // Alert level
  alertLevel: 'none' | 'info' | 'warning' | 'critical';

  // Active alerts
  alerts: Alert[];

  // Next actions
  nextMaintenanceCheck?: Timestamp;
  nextPositionCheck?: Timestamp;
  removalDueBy?: Timestamp;
}

export interface TubeWithAlerts {
  tubeId: string;
  babyId: string;
  tubeType: 'NG' | 'OG';
  insertionDate: Timestamp;

  // Current status
  isActive: boolean;
  daysInSitu: number;
  hoursInSitu: number;

  // pH status
  lastPH?: number;
  lastPHCheck?: Timestamp;
  phStatus: 'safe' | 'warning' | 'critical' | 'unknown';

  // Alert level
  alertLevel: 'none' | 'info' | 'warning' | 'critical';

  // Active alerts
  alerts: Alert[];

  // Next actions
  nextPositionCheck?: Timestamp;
  changeDueBy?: Timestamp;
}

/**
 * Alert aggregation for dashboard
 */
export interface AlertSummary {
  babyId: string;
  lastUpdated: Timestamp;

  // Count by severity
  totalActive: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;

  // Count by type
  lineAlerts: number;
  tubeAlerts: number;
  screeningAlerts: number;
  medicationAlerts: number;
  clinicalAlerts: number;

  // Most urgent
  mostUrgentAlert?: Alert;

  // Requires immediate action
  requiresImmediateAction: boolean;
  actionableAlerts: Alert[];
}

/**
 * Alert history for audit
 */
export interface AlertHistory extends BabyRecord {
  alerts: {
    alert: Alert;
    statusChanges: {
      timestamp: Timestamp;
      fromStatus: AlertStatus;
      toStatus: AlertStatus;
      changedBy: string;
      reason?: string;
    }[];
  }[];
}
