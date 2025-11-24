import { Timestamp } from 'firebase/firestore';

// Re-export all type modules
export * from './user';
export * from './clinical';
export * from './procedures';
export * from './discharge';

// Baby types (Extended for NHS compliance)
export interface Baby {
  id: string;

  // NHS Identifiers
  nhsNumber?: string;
  hospitalNumber: string;

  // Personal Details
  firstName?: string;
  lastName?: string;
  dateOfBirth: Timestamp;
  sex: 'male' | 'female' | 'unknown';

  // Birth Details
  gestationalAgeAtBirth: {
    weeks: number;
    days: number;
  };
  birthWeight: number;              // grams
  birthLength?: number;             // cm
  birthHeadCircumference?: number;  // cm

  // Extended Birth Information
  birthDetails?: {
    deliveryMethod: 'SVD' | 'forceps' | 'ventouse' | 'elective_CS' | 'emergency_CS';
    apgarScores: {
      oneMin: number;
      fiveMin: number;
      tenMin?: number;
    };
    resuscitation: boolean;
    resuscitationDetails?: string;
    birthLocation: string;
    plurality: 'singleton' | 'twin' | 'triplet' | 'quadruplet' | 'other';
    complications?: string[];
  };

  // Maternal Links
  motherNhsNumber?: string;
  fatherNhsNumber?: string;

  // Location
  unitId: string;
  trustId: string;
  bedNumber?: string;
  roomNumber?: string;

  // Admission
  admissionDate: Timestamp;
  admissionDiagnoses?: string[];

  // Current Status
  diagnoses: string[];
  isActive: boolean;
  outcomeStatus: 'inpatient' | 'discharged_home' | 'transferred' | 'deceased';

  // Discharge
  expectedDischargeDate?: Timestamp;
  dischargeDate?: Timestamp;
  dischargeDestination?: string;

  // Care Team
  parentUserIds: string[];
  primaryNurseId?: string;
  consultantId?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Medication types
export interface MedicationPrescription {
  id: string;
  babyId: string;
  medicationName: string;
  dose: {
    amount: number;
    unit: 'mg' | 'ml' | 'mcg' | 'units' | 'drops' | 'mg/kg';
  };
  route: 'IV' | 'oral' | 'IM' | 'topical' | 'inhalation' | 'NG_tube';
  frequency: string;
  timings: string[];
  startDate: Timestamp;
  endDate?: Timestamp;
  indication: string;
  canBeGivenInFeed: boolean;
  mustBeGivenSeparately: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'discontinued';
  prescribedBy: string;
  prescribedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MedicationAdministration {
  id: string;
  babyId: string;
  prescriptionId: string;
  medicationName: string;
  dose: {
    amount: number;
    unit: string;
  };
  route: string;
  scheduledTime: Timestamp;
  administeredTime?: Timestamp;
  administrationMethod: 'separately' | 'in_feed';
  feedRecordId?: string;
  status: 'pending' | 'given' | 'missed' | 'refused' | 'held';
  administeredBy?: string;
  reasonNotGiven?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Feeding types
export interface FeedingRecord {
  id: string;
  babyId: string;
  feedTime: Timestamp;
  recordedBy: string;
  feedType: 'EBM' | 'formula' | 'fortified_EBM' | 'fortified_formula' | 'TPN' | 'mixed';
  volume: {
    prescribed: number;
    actual: number;
  };
  route: 'oral_bottle' | 'oral_breast' | 'NG_tube' | 'OG_tube' | 'IV' | 'mixed';
  medicationsIncluded: {
    medicationAdministrationId: string;
    medicationName: string;
    confirmed: boolean;
  }[];
  tolerance: 'good' | 'moderate' | 'poor';
  residual?: number;
  vomiting?: {
    occurred: boolean;
    amount?: string;
  };
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Care Plan types
export interface CarePlan {
  id: string;
  babyId: string;
  type: 'feeding' | 'respiratory' | 'medication' | 'developmental' | 'general';
  title: string;
  description: string;
  instructions: string[];
  feedingSchedule?: {
    frequency: number;
    volumePerFeed: number;
    feedType: string;
    route: string;
  };
  status: 'active' | 'inactive' | 'archived';
  effectiveFrom: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Vital Signs types
export interface VitalSign {
  id: string;
  babyId: string;
  recordedAt: Timestamp;
  recordedBy: string;
  weight?: {
    value: number;
  };
  temperature?: {
    value: number;
    site: 'axillary' | 'skin';
  };
  heartRate?: {
    value: number;
  };
  respiratoryRate?: {
    value: number;
  };
  oxygenSaturation?: {
    value: number;
    oxygenSupport?: {
      type: string;
      fiO2?: number;
    };
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  notes?: string;
  createdAt: Timestamp;
}
