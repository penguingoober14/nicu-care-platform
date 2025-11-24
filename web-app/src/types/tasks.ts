import { Timestamp } from 'firebase/firestore';

// Enhanced Care Plan (Ward Round-Driven)
export interface EnhancedCarePlan {
  id: string;
  babyId: string;

  // Ward Round Context
  version: number;
  wardRoundDate: Timestamp;
  supersedes?: string; // Previous care plan ID

  // Categorization
  category: 'comprehensive' | 'feeding' | 'respiratory' | 'medication' | 'observation' | 'procedural' | 'developmental';
  title: string;
  description: string;

  // Clinical Ownership
  prescribedBy: string; // Staff user ID
  approvedBy?: string;
  reviewDate?: Timestamp; // Next planned review

  // Status & Lifecycle
  status: 'active' | 'suspended' | 'completed' | 'superseded';
  effectiveFrom: Timestamp;
  effectiveUntil?: Timestamp;

  // STRUCTURED CARE PARAMETERS

  // 1. Feeding Schedule
  feedingPlan?: {
    frequency: number; // Hours between feeds
    volumePerFeed: number; // ml
    feedType: 'EBM' | 'formula' | 'fortified_EBM' | 'fortified_formula' | 'TPN';
    route: 'oral_bottle' | 'oral_breast' | 'NG_tube' | 'OG_tube' | 'IV';
    fortification?: {
      type: string;
      scoopsPer100ml: number;
    };
    specialInstructions?: string[];
    aspirateBeforeFeed: boolean;
    minimumInterval?: number; // Min hours between feeds
  };

  // 2. Medication Regimen (links to prescriptions)
  medicationPlan?: {
    prescriptionIds: string[]; // Link to MedicationPrescription records
    administrationGuidelines?: string;
  };

  // 3. Vital Signs Monitoring
  observationPlan?: {
    frequency: 'continuous' | 'hourly' | '2-hourly' | '4-hourly' | '6-hourly';
    parameters: {
      weight?: { frequency: 'daily' | 'twice-daily' | 'weekly'; time?: string };
      temperature: boolean;
      heartRate: boolean;
      respiratoryRate: boolean;
      oxygenSaturation: boolean;
      bloodPressure: boolean;
    };
    escalationCriteria?: {
      parameter: string;
      threshold: string;
      action: string;
    }[];
  };

  // 4. Respiratory Support
  respiratoryPlan?: {
    mode: 'IPPV' | 'SIMV' | 'CPAP' | 'HFOV' | 'nasal_cannula' | 'room_air';
    settings?: {
      fiO2Target: number;
      peep?: number;
      pip?: number;
      rate?: number;
    };
    weaningProtocol?: string;
    assessmentFrequency: string;
  };

  // 5. Procedural Care
  proceduralPlan?: {
    lineCare?: {
      lineIds: string[]; // References to PeripheralCentralLineRecord
      flushFrequency: number; // Hours
      dressingChangeFrequency: number; // Days
    };
    tubeCare?: {
      tubeIds: string[];
      positionCheckFrequency: number; // Hours
    };
    positionChanges?: {
      frequency: number; // Hours
      positions: string[]; // e.g., "prone", "supine", "left lateral"
    };
    skinAssessments?: {
      frequency: number; // Hours
    };
  };

  // 6. Developmental Care
  developmentalPlan?: {
    kangarooCare: boolean;
    minimumHandling: boolean;
    clusteredCare: boolean;
    lightReduction: boolean;
    noiseReduction: boolean;
  };

  // Free-text instructions
  additionalInstructions?: string[];

  // Change Log
  changeHistory?: {
    date: Timestamp;
    changedBy: string;
    changes: string;
    reason: string;
  }[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Task Detail Types
export interface FeedingTaskDetails {
  volumeML: number;
  feedType: string;
  route: string;
  medicationsToInclude?: {
    medicationAdministrationId: string;
    medicationName: string;
  }[];
  aspirateRequired: boolean;
  fortification?: string;
}

export interface MedicationTaskDetails {
  prescriptionId: string;
  medicationName: string;
  dose: { amount: number; unit: string };
  route: string;
  canBeGivenInFeed: boolean;
  mustBeGivenSeparately: boolean;
}

export interface VitalSignsTaskDetails {
  parameters: ('weight' | 'temperature' | 'heartRate' | 'respiratoryRate' | 'oxygenSaturation' | 'bloodPressure')[];
  isRoutineCheck: boolean;
  specialInstructions?: string;
}

export interface ProcedureTaskDetails {
  procedureType: 'line_flush' | 'dressing_change' | 'tube_position_check' | 'position_change' | 'skin_assessment';
  specificInstructions?: string;
  equipmentRequired?: string[];
  targetLineOrTubeId?: string;
}

export type TaskDetails = FeedingTaskDetails | MedicationTaskDetails | VitalSignsTaskDetails | ProcedureTaskDetails;

// Nursing Task (Auto-Generated from Care Plans)
export interface NursingTask {
  id: string;
  babyId: string;

  // Source/Generation
  generatedFrom: {
    sourceType: 'care_plan' | 'medication_prescription' | 'manual';
    sourceId: string; // Care plan or prescription ID
    version?: number; // Care plan version at generation
  };

  // Task Classification
  taskType: 'feeding' | 'medication' | 'vital_signs' | 'procedure' | 'assessment' | 'position_change' | 'skin_care' | 'line_care';
  taskCategory: 'routine' | 'prn' | 'stat' | 'urgent';

  // Scheduling
  scheduledDateTime: Timestamp;
  scheduledTimeOfDay?: string; // "08:00" for display
  windowStart?: Timestamp; // "Can be done from..."
  windowEnd?: Timestamp; // "Must be done by..."

  // Shift Assignment
  shift?: {
    type: 'day' | 'night' | 'long_day';
    date: Timestamp; // Shift date (start date for night shifts)
    shiftId: string; // Unique identifier for this shift instance
  };

  // Recurrence (for series identification)
  recurrencePattern?: {
    frequency: 'once' | 'hourly' | '2-hourly' | '3-hourly' | '4-hourly' | 'daily';
    seriesId: string; // Groups recurring tasks
    instanceNumber: number; // 1st, 2nd, 3rd feed of the day
  };

  // Task Details (polymorphic based on taskType)
  taskDetails: TaskDetails;

  // Status Workflow
  status: 'pending' | 'due' | 'overdue' | 'in_progress' | 'completed' | 'missed' | 'cancelled' | 'deferred';

  // Assignment
  assignedTo?: string; // Nurse user ID
  assignedBy?: string;

  // Completion (links to actual record)
  completedAt?: Timestamp;
  completedBy?: string;
  completionRecordType?: 'FeedingRecord' | 'MedicationAdministration' | 'VitalSign' | 'ProcedureRecord';
  completionRecordId?: string; // Link to actual documentation

  // Variance/Exception Tracking
  variance?: {
    type: 'time_delayed' | 'not_completed' | 'partial' | 'refused' | 'contraindicated';
    reason: string;
    alternativeAction?: string;
  };

  // Priority & Flags
  priority: 'routine' | 'important' | 'urgent' | 'critical';
  flags?: ('first_time' | 'needs_two_nurses' | 'parent_present' | 'sterile')[];

  // Notifications
  reminderSent?: boolean;
  escalationRequired?: boolean;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  autoGenerated: boolean;
}

// Task Completion Summary (Variance Tracking)
export interface TaskCompletionSummary {
  id: string;
  babyId: string;

  // Time Period
  date: Timestamp;
  shift?: 'day' | 'night' | 'long_day';

  // Task Compliance
  totalTasksScheduled: number;
  tasksCompleted: number;
  tasksDeferred: number;
  tasksMissed: number;
  tasksCancelled: number;

  // Variance Analysis
  variances: {
    taskId: string;
    taskType: string;
    scheduledTime: Timestamp;
    actualTime?: Timestamp;
    varianceMinutes?: number;
    reason: string;
  }[];

  // Clinical Significance Flags
  clinicallySignificantVariances: boolean;
  escalatedToMedicalTeam: boolean;

  // Compiled By
  compiledBy: string;

  // Metadata
  createdAt: Timestamp;
}

// Shift Handover Report
export interface ShiftHandoverReport {
  id: string;
  babyId: string;
  shift: 'day' | 'night' | 'long_day';
  date: Timestamp;

  // Outstanding tasks from previous shift
  outstandingTasks: NursingTask[];

  // Upcoming tasks in next 4 hours
  upcomingTasks: NursingTask[];

  // Key variances to communicate
  significantVariances: {
    task: NursingTask;
    variance: string;
    clinicalImplication: string;
  }[];

  // Care plan changes today
  carePlanUpdates: {
    plan: EnhancedCarePlan;
    changes: string;
    effectiveFrom: Timestamp;
  }[];

  // Handover
  handedOverBy: string;
  handedOverTo: string;
  handoverTime: Timestamp;

  // Metadata
  createdAt: Timestamp;
}
