// Re-export all consolidated types
export * from './core.types';
export * from './clinical.types';

// Re-export tasks types (except EnhancedCarePlan which is in clinical.types)
export type {
  FeedingTaskDetails,
  MedicationTaskDetails,
  VitalSignsTaskDetails,
  ProcedureTaskDetails,
  TaskDetails,
  NursingTask,
  TaskCompletionSummary,
  ShiftHandoverReport,
} from './tasks';

// Re-export enhancement types
export * from './compliance.types';
export * from './episodes.types';
export * from './alerts.types';
export * from './screening.types';
export * from './discharge-criteria.types';
