/**
 * Central data export
 * All demo data is organized by domain for better maintainability
 */

// Re-export all data collections
export * from './patients.data';
export * from './clinical.data';
export * from './procedures.data';
export * from './discharge.data';
export * from './tasks.data';

// Re-export generators
export * from './generators';

// Import all for the unified store
import { DEMO_USERS, DEMO_BABIES, DEMO_PARENTS, DEMO_HOUSING } from './patients.data';
import {
  DEMO_PRESCRIPTIONS,
  DEMO_MEDICATIONS,
  DEMO_CARE_PLANS,
  DEMO_FEEDS,
  DEMO_VITAL_SIGNS,
  DEMO_BLOOD_GAS,
  DEMO_FLUID_BALANCE,
  DEMO_24HR_RESUME,
  DEMO_INFECTIONS,
  DEMO_ENHANCED_CARE_PLANS,
} from './clinical.data';
import {
  DEMO_CONSENTS,
  DEMO_IV_LINES,
  DEMO_NG_TUBES,
  DEMO_SAMPLES,
  DEMO_ADMISSION_ASSESSMENTS,
} from './procedures.data';
import { DEMO_DISCHARGE_CHECKLISTS, DEMO_WEIGHT_CHARTS } from './discharge.data';
import { DEMO_NURSING_TASKS, DEMO_TASK_COMPLETION_SUMMARIES } from './tasks.data';

/**
 * Unified mock data store
 * Provides backward compatibility with existing code
 */
export const mockDataStore = {
  // Patients & Users
  users: DEMO_USERS,
  babies: DEMO_BABIES,
  parents: DEMO_PARENTS,
  housing: DEMO_HOUSING,

  // Clinical
  prescriptions: DEMO_PRESCRIPTIONS,
  medications: DEMO_MEDICATIONS,
  carePlans: DEMO_CARE_PLANS,
  feeds: DEMO_FEEDS,
  vitalSigns: DEMO_VITAL_SIGNS,
  bloodGas: DEMO_BLOOD_GAS,
  fluidBalance: DEMO_FLUID_BALANCE,
  twentyFourHrResume: DEMO_24HR_RESUME,
  infections: DEMO_INFECTIONS,
  enhancedCarePlans: DEMO_ENHANCED_CARE_PLANS,

  // Procedures
  consents: DEMO_CONSENTS,
  ivLines: DEMO_IV_LINES,
  ngTubes: DEMO_NG_TUBES,
  samples: DEMO_SAMPLES,
  admissionAssessments: DEMO_ADMISSION_ASSESSMENTS,

  // Discharge
  dischargeChecklists: DEMO_DISCHARGE_CHECKLISTS,
  weightCharts: DEMO_WEIGHT_CHARTS,

  // Tasks (lazy loaded)
  nursingTasks: DEMO_NURSING_TASKS,
  taskCompletionSummaries: DEMO_TASK_COMPLETION_SUMMARIES,
};
