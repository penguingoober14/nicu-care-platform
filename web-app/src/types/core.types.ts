import { Timestamp } from 'firebase/firestore';

// ============================================================================
// BASE TYPES & COMMON PATTERNS
// ============================================================================

/**
 * Base interface for all records with timestamps
 */
export interface Timestamped {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Base interface for records associated with a baby
 */
export interface BabyRecord extends Timestamped {
  id: string;
  babyId: string;
}

/**
 * Base interface for records with a performing staff member
 */
export interface StaffPerformed {
  performedBy: string;
  performedAt: Timestamp;
}

/**
 * Common status types
 */
export type RecordStatus = 'active' | 'inactive' | 'archived' | 'deleted';
export type ApprovalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'discontinued';
export type CompletionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole =
  | 'bedside_nurse'
  | 'consultant'
  | 'junior_doctor'
  | 'ward_manager'
  | 'physiotherapist'
  | 'parent';

export type Permission =
  | 'read_patient_data'
  | 'write_patient_data'
  | 'administer_medication'
  | 'prescribe_medication'
  | 'view_all_patients'
  | 'manage_staff'
  | 'view_own_baby_only';

export interface User extends Timestamped {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  unitId: string;
  trustId: string;
  isActive?: boolean;
}

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  bedside_nurse: 'Bedside Nurse',
  consultant: 'Consultant',
  junior_doctor: 'Junior Doctor',
  ward_manager: 'Ward Manager',
  physiotherapist: 'Physiotherapist',
  parent: 'Parent',
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  bedside_nurse: ['read_patient_data', 'write_patient_data', 'administer_medication'],
  consultant: ['read_patient_data', 'write_patient_data', 'prescribe_medication', 'view_all_patients'],
  junior_doctor: ['read_patient_data', 'write_patient_data', 'prescribe_medication'],
  ward_manager: ['read_patient_data', 'view_all_patients', 'manage_staff'],
  physiotherapist: ['read_patient_data', 'write_patient_data'],
  parent: ['view_own_baby_only'],
};

// ============================================================================
// BABY (PATIENT) TYPES
// ============================================================================

export interface Baby extends Timestamped {
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
  birthWeight: number; // grams
  birthLength?: number; // cm
  birthHeadCircumference?: number; // cm

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
  createdBy: string;
}

export interface CorrectedGestationalAge {
  weeks: number;
  days: number;
}

// ============================================================================
// PARENT/GUARDIAN TYPES
// ============================================================================

export interface Parent extends Timestamped {
  id: string;
  babyIds: string[];

  // Identity
  nhsNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Timestamp;

  // Demographics
  age?: number;
  occupation?: string;
  ethnicity?: string;
  religion?: string;
  firstLanguage?: string;
  interpreterRequired: boolean;

  // Relationship
  relationship: 'mother' | 'father' | 'guardian' | 'adoptive_parent' | 'foster_parent' | 'other';
  relationshipToBaby?: string;
  parentalResponsibility: boolean;

  // Contact Details
  contactDetails: {
    mobilePhone?: string;
    homePhone?: string;
    workPhone?: string;
    email?: string;
    preferredContactMethod?: 'mobile' | 'home' | 'email' | 'work';
  };

  // Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    sameAsBaby: boolean;
  };

  // Parental Status
  relationshipStatus?: 'single' | 'married' | 'stable_relationship' | 'separated' | 'divorced';

  // Emergency Contact
  isEmergencyContact: boolean;
  emergencyContactPriority?: number;

  // Engagement
  visitLog?: {
    date: Timestamp;
    duration?: number;
    activities?: string[];
  }[];
}

export interface BabyHousing extends Timestamped {
  id: string;
  babyId: string;

  // Living Arrangements
  livingArrangements: 'owns_home' | 'rents_privately' | 'social_housing' | 'family_or_friends' | 'temporary_accommodation' | 'homeless';

  // Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
  };

  // Housing Details
  numberOfBedrooms: number;
  householdSmoker: boolean;

  // Household Members
  householdMembers: {
    name: string;
    relationship: string;
    age?: number;
  }[];

  // Other Children
  otherChildren: {
    name: string;
    age: number;
    relationship: string;
  }[];

  // Social Services
  socialServicesInvolved: boolean;
  socialWorkerName?: string;
  socialWorkerContact?: string;

  // Special Circumstances
  specialCircumstances?: string[];

  // Safeguarding
  safeguardingConcerns: boolean;
  childProtectionPlan: boolean;
}

// ============================================================================
// MEDICATION TYPES
// ============================================================================

export type MedicationRoute = 'IV' | 'oral' | 'IM' | 'topical' | 'inhalation' | 'NG_tube' | 'OG_tube';
export type MedicationUnit = 'mg' | 'ml' | 'mcg' | 'units' | 'drops' | 'mg/kg';

export interface MedicationPrescription extends BabyRecord {
  medicationName: string;
  dose: {
    amount: number;
    unit: MedicationUnit;
  };
  route: MedicationRoute;
  frequency: string;
  timings: string[]; // ["08:00", "14:00", "20:00"]
  startDate: Timestamp;
  endDate?: Timestamp;
  indication: string;
  canBeGivenInFeed: boolean;
  mustBeGivenSeparately: boolean;
  isPRN?: boolean;
  controlledDrug?: boolean;
  status: ApprovalStatus;
  prescribedBy: string;
  prescribedAt: Timestamp;
}

export interface MedicationAdministration extends BabyRecord {
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
}

// ============================================================================
// FEEDING TYPES
// ============================================================================

export type FeedType = 'EBM' | 'formula' | 'fortified_EBM' | 'fortified_formula' | 'TPN' | 'mixed';
export type FeedRoute = 'oral_bottle' | 'oral_breast' | 'NG_tube' | 'OG_tube' | 'IV' | 'mixed';
export type FeedTolerance = 'good' | 'moderate' | 'poor';

export interface FeedingRecord extends BabyRecord {
  feedTime: Timestamp;
  recordedBy: string;
  feedType: FeedType;
  volume: {
    prescribed: number;
    actual: number;
  };
  route: FeedRoute;
  medicationsIncluded: {
    medicationAdministrationId: string;
    medicationName: string;
    confirmed: boolean;
  }[];
  tolerance: FeedTolerance;
  residual?: number;
  vomiting?: {
    occurred: boolean;
    amount?: string;
  };
  notes?: string;
}

// ============================================================================
// VITAL SIGNS TYPES
// ============================================================================

export interface VitalSign extends BabyRecord {
  recordedAt: Timestamp;
  recordedBy: string;

  weight?: {
    value: number; // grams
  };

  temperature?: {
    value: number; // Celsius
    site: 'axillary' | 'skin' | 'rectal';
  };

  heartRate?: {
    value: number; // bpm
  };

  respiratoryRate?: {
    value: number; // breaths per minute
  };

  oxygenSaturation?: {
    value: number; // percentage
    oxygenSupport?: {
      type: string;
      fiO2?: number;
    };
  };

  bloodPressure?: {
    systolic: number;
    diastolic: number;
    mean?: number;
  };

  notes?: string;
}

// ============================================================================
// CARE PLAN TYPES
// ============================================================================

export interface CarePlan extends BabyRecord {
  type: 'feeding' | 'respiratory' | 'medication' | 'developmental' | 'general';
  title: string;
  description: string;
  instructions: string[];

  feedingSchedule?: {
    frequency: number; // hours
    volumePerFeed: number; // ml
    feedType: string;
    route: string;
  };

  status: RecordStatus;
  effectiveFrom: Timestamp;
  createdBy: string;
}
