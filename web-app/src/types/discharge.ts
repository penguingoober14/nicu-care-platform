import { Timestamp } from 'firebase/firestore';

// Housing & Social Circumstances
export interface BabyHousing {
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

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Parent/Guardian Object
export interface Parent {
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
  relationshipToBaby?: string;     // Free text if 'other'
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
    duration?: number;              // minutes
    activities?: string[];          // e.g., "Kangaroo care", "Feeding"
  }[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Discharge Checklist
export interface DischargeChecklist {
  id: string;
  babyId: string;

  // Parental Details
  motherName: string;
  fatherName?: string;
  parentalRelationshipStatus: 'single' | 'married' | 'stable_relationship' | 'separated';

  // Siblings
  siblings: {
    name: string;
    age: number;
  }[];

  // GP Details
  gpDetails: {
    practiceName: string;
    gpName?: string;
    address?: string;
    phone?: string;
    registered: boolean;
  };

  // Health Visitor
  healthVisitor?: {
    name: string;
    contact: string;
    informed: boolean;
  };

  // Community Team Referrals
  communityReferrals: {
    communityNurse: boolean;
    healthVisitor: boolean;
    communityPaediatrician: boolean;
    earlyInterventionTeam: boolean;
    physiotherapy: boolean;
    occupationalTherapy: boolean;
    speechAndLanguage: boolean;
    dietitian: boolean;
    other?: string[];
  };

  // Hospital Referrals
  hospitalReferrals: {
    ophthalmology: boolean;
    ophthalmologyDate?: Timestamp;
    audiology: boolean;
    audiologyDate?: Timestamp;
    cardiology: boolean;
    cardiologyDate?: Timestamp;
    respiratory: boolean;
    respiratoryDate?: Timestamp;
    neurology: boolean;
    neurologyDate?: Timestamp;
    other?: { service: string; date?: Timestamp }[];
  };

  // Infant Services Required
  infantServicesRequired: {
    hearingScreening: { required: boolean; completed: boolean; date?: Timestamp };
    eyeScreening: { required: boolean; completed: boolean; date?: Timestamp };
    oxygenTeam: { required: boolean; arranged: boolean };
    nasogastricFeeding: { required: boolean; parentsTrained: boolean };
    medicationAdministration: { required: boolean; parentsTrained: boolean };
    apnoeaMonitor: { required: boolean; arranged: boolean };
    other?: { service: string; required: boolean; arranged: boolean }[];
  };

  // Parent Education Completed
  parentEducation: {
    basicBabyCare: boolean;
    feedingSupport: boolean;
    medicationAdministration: boolean;
    cpRTraining: boolean;
    recognisingIllness: boolean;
    safeSleeping: boolean;
    carSeatSafetyCheck: boolean;
    smokingCessationAdvice: boolean;
    immunisationDiscussion: boolean;
  };

  // Medications Going Home
  medicationsGoingHome: {
    medication: string;
    dose: string;
    frequency: string;
    duration?: string;
    prescriptionProvided: boolean;
  }[];

  // Equipment Going Home
  equipmentGoingHome: {
    oxygenConcentrator: boolean;
    apnoeaMonitor: boolean;
    feedingPump: boolean;
    nasogastricTubes: boolean;
    suction: boolean;
    other?: string[];
  };

  // Follow-up Appointments
  followUpAppointments: {
    service: string;
    date?: Timestamp;
    location?: string;
    booked: boolean;
  }[];

  // Discharge Summary
  dischargeSummary: {
    completed: boolean;
    sentToGP: boolean;
    sentToHealthVisitor: boolean;
    copyToParents: boolean;
  };

  // Red Book
  redBookCompleted: boolean;
  redBookGivenToParents: boolean;

  // Actual Discharge
  plannedDischargeDate?: Timestamp;
  actualDischargeDate?: Timestamp;
  dischargeTime?: string;
  dischargedBy?: string;

  // Discharge Destination
  dischargeDestination: 'home' | 'foster_care' | 'other_hospital' | 'other';

  // Transport
  transportHome: 'own_car' | 'taxi' | 'ambulance' | 'other';
  carSeatAvailable: boolean;

  // Weight at Discharge
  dischargeWeight?: number;

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Weight Chart (Daily Tracking)
export interface DailyWeightChart {
  id: string;
  babyId: string;

  // Daily Weights
  weights: {
    date: Timestamp;
    ageInDays: number;
    correctedGestationalAge: { weeks: number; days: number };
    weightGrams: number;
    weightKg: number;
    percentile?: number;
    zScore?: number;
    measurementMethod: 'scale' | 'estimated';
    measuredBy: string;
  }[];

  // Growth Assessment
  growthAssessment?: {
    assessmentDate: Timestamp;
    birthWeight: number;
    currentWeight: number;
    weightGain: number;              // Total gain in grams
    averageDailyGain: number;        // g/day
    percentWeightLoss?: number;      // % from birth weight
    backToBirthWeight: boolean;
    backToBirthWeightDate?: Timestamp;
    growthVelocity: 'poor' | 'adequate' | 'good' | 'excessive';
    nutritionalConcerns: boolean;
    nutritionalPlan?: string;
  };

  // Chart Type
  chartType: 'Fenton' | 'UK-WHO' | 'Intergrowth-21st';

  // Target Weight
  targetWeight?: {
    date: Timestamp;
    targetGrams: number;
    achieved: boolean;
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Clinical Notes / Evaluation Sheet
export interface EvaluationSheet {
  id: string;
  babyId: string;

  // Timing
  date: Timestamp;
  time: string;

  // Note Type
  noteType: 'medical' | 'nursing' | 'physiotherapy' | 'occupational_therapy' | 'speech_therapy' | 'social_work' | 'other';

  // Author
  authorId: string;
  authorName: string;
  authorDesignation: string;        // e.g., "Consultant", "Junior Doctor", "Nurse"

  // Structured Note (Problem-Based)
  problemNumber?: number;
  problemDescription?: string;

  // SOAP Format
  soap?: {
    subjective?: string;             // What parents/nurses report
    objective?: string;              // Examination findings, observations
    assessment?: string;             // Clinical interpretation
    plan?: string;                   // Management plan
  };

  // Free Text (Alternative)
  freeText?: string;

  // Review Type
  reviewType?: 'ward_round' | 'daily_review' | 'admission' | 'discharge' | 'emergency' | 'procedure' | 'routine';

  // Signature
  signed: boolean;
  signatureDateTime?: Timestamp;

  // Evaluation Outcome
  evaluationOutcome?: 'improving' | 'stable' | 'deteriorating' | 'discharged' | 'deceased';

  // Follow-up Required
  followUpRequired: boolean;
  followUpDate?: Timestamp;
  followUpBy?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
